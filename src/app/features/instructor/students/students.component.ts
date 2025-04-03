import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { InstructorSidebarComponent } from '../../../shared/components/instructor-sidebar/instructor-sidebar.component';
import { CourseServiceService } from '../../../core/services/instructor/course.service.service';
import { Subscription } from 'rxjs';
import { ICourse } from '../../../core/models/ICourse';
import { CommonModule } from '@angular/common';
import { IUser } from '../../../core/models/IUser';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../../../environments/environment';
import { ActivatedRoute } from '@angular/router';
import { generateChatRoomId } from '../../../core/utils/chat.utils';

interface ChatMessage {
  _id?: string;
  chatRoomId: string;
  sender: string;
  message: string;
  timestamp: string;
  isInstructor?: boolean;
  tempId: any
}

@Component({
  selector: 'app-students',
  standalone: true,
  imports: [InstructorSidebarComponent, CommonModule, ReactiveFormsModule],
  templateUrl: './students.component.html',
  styleUrls: ['./students.component.css'],
})
export class StudentsComponent implements OnInit, OnDestroy {
  allCourses: ICourse[] = [];
  instructorId: string | null = null;
  enrolledStudents: IUser[] = [];
  allStudents: IUser[] = [];
  courseId: string | null = null;
  course: ICourse | null = null;
  selectedStudentId: string | null = null;
  selectedStudentName: string | null = null;
  chatMessages: { sender: string; message: string; timestamp: string; isInstructor: boolean; chatRoomId?: string, tempId: any }[] = [];
  chatForm!: FormGroup;
  socket!: Socket;
  showChatModal: boolean = false;

  private _subscription: Subscription = new Subscription();

  constructor(private _courseService: CourseServiceService, private _fb: FormBuilder, private _cdr: ChangeDetectorRef, private _route: ActivatedRoute) {}

  ngOnInit(): void {
    this.courseId = this._route.snapshot.paramMap.get('id');
    this.instructorId = this.getInstructorId();
    this.chatFormInit();
    this.getCourses();
    this.getAllStudents();
    this.initializeSocket();
    console.log('enr', this.enrolledStudents);
  }

  getCourses(): void {
    this._subscription.add(
      this._courseService.getCourses().subscribe({
        next: (response) => {
          this.allCourses = response.result;
          if (this.instructorId) {
            this.getStudents(this.instructorId, this.allCourses);
            if (this.courseId) {
              this.course = this.allCourses.find((c) => c._id === this.courseId) || null;
            }
          }
          this._cdr.detectChanges();
        },
        error: (error) => console.error('Error fetching courses:', error),
      })
    );
  }

  chatFormInit(): void {
    this.chatForm = this._fb.group({
      message: ['', Validators.required],
    });
  }

  initializeSocket(): void {
    this.socket = io(environment.apiUrl, {
      auth: {
        token: localStorage.getItem('instructorToken') || localStorage.getItem('token'),
        instructorId: this.instructorId
      },
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    this.socket.on('connect', () => {
      console.log('Instructor connected to chat server with ID:', this.socket.id);
    });

    this.socket.on('connect_error', (err) => {
      console.error('Connection error:', err);
    });

    this.socket.on('chatMessage', (data: ChatMessage) => {
      console.log('Received message:', data);
      if (this.selectedStudentId) {
        const expectedChatRoomId = this.generateChatRoomId(this.selectedStudentId);
        
        if (data.chatRoomId === expectedChatRoomId) {
          // Check if this is the same message we just sent (by tempId)
          if (data.tempId && this.chatMessages.some(msg => msg.tempId === data.tempId)) {
            // This is a message we already added optimistically, so update it with server data
            this.chatMessages = this.chatMessages.map(msg => 
              msg.tempId === data.tempId ? { ...data, isInstructor: data.sender === this.instructorId } : msg
            );
          } else {
            // This is a new message (from student or from another session)
            this.chatMessages = [
              ...this.chatMessages,
              {
                ...data,
                isInstructor: data.sender === this.instructorId
              }
            ];
          }
          this._cdr.detectChanges();
          this.scrollToBottom();
        }
      }
    });

    this.socket.on('previousMessages', (messages: ChatMessage[]) => {
      console.log('Received previous messages:', messages);
      this.chatMessages = messages.map(msg => ({
        ...msg,
        isInstructor: msg.sender === this.instructorId,
        timestamp: msg.timestamp
      }));
      this._cdr.detectChanges();
      this.scrollToBottom();
    });
  }

  openChat(studentId: string): void {
    console.log('Opening chat with student:', studentId);
    this.selectedStudentId = studentId;
    this.selectedStudentName = this.getStudentName(studentId);
    
    const chatRoomId = this.generateChatRoomId(studentId);
    console.log('Generated chat room ID:', chatRoomId);
    
    // Clear previous messages first
    this.chatMessages = [];
    
    // Join the room - remove courseId
    this.socket.emit('joinPrivateChat', { 
      chatRoomId
    });
    
    this.showChatModal = true;
    this._cdr.detectChanges();
  }

  sendMessage(): void {
    if (this.chatForm.valid && this.selectedStudentId && this.instructorId) {
      const message = this.chatForm.value.message;
      const chatRoomId = this.generateChatRoomId(this.selectedStudentId);
      
      // Generate a temporary unique ID for this message
      const tempId = Date.now().toString();
      
      // Optimistic update with tempId
      const tempMessage = {
        chatRoomId,
        sender: this.instructorId,
        message,
        timestamp: new Date().toISOString(),
        isInstructor: true,
        tempId // Add this to identify the message
      };
      
      this.chatMessages = [...this.chatMessages, tempMessage];
      this.chatForm.reset();
      this._cdr.detectChanges();
      this.scrollToBottom();
  
      // Send to server
      this.socket.emit('chatMessage', {
        chatRoomId,
        sender: this.instructorId,
        message,
        tempId // Send the tempId to track this message
      });
    }
  }

  generateChatRoomId(studentId: string): string {
    // Sort IDs to ensure consistent room ID
    const ids = [this.instructorId, studentId].sort();
    return `${ids[0]}_${ids[1]}`.replace(/[^a-zA-Z0-9]/g, '');
  }

  private getStudentName(studentId: string): string {
    // Implement your logic to get student name
    return 'Student'; // Replace with actual lookup
  }

  scrollToBottom(): void {
    setTimeout(() => {
      const container = document.getElementById('instructor-chat-container');
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    }, 100);
  }

  closeChat(): void {
    this.selectedStudentId = null;
    this.selectedStudentName = '';
    this.chatMessages = [];
    this.showChatModal = false;
  }


  getAllStudents(): void {
    this._subscription.add(
      this._courseService.getAllStudents().subscribe({
        next: (response) => {
          this.allStudents = response.result;
          console.log('all student', this.allStudents);
          if (this.instructorId && this.allCourses.length) {
            this.getStudents(this.instructorId, this.allCourses);
          }
        },
        error: (error) => console.error('Error fetching all students:', error),
      })
    );
  }

  getInstructorId(): string | null {
    const token = localStorage.getItem('instructorToken') || localStorage.getItem('token');
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.id || null;
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }

  getStudents(instructorId: string | null, allCourses: ICourse[]): void {
    this.enrolledStudents = [];
    console.log('isn', instructorId, allCourses);
    allCourses.forEach((course) => {
      if (course.instructorId && (typeof course.instructorId === 'string' ? course.instructorId : course.instructorId._id) === instructorId) {
        course.enrolledStudents.forEach((enrolledStudent) => {
          const studentId = Array.isArray(enrolledStudent.studentId) ? enrolledStudent.studentId[0] : enrolledStudent.studentId;
          console.log('student de', enrolledStudent, 'Extracted studentId:', studentId);

          const studentDetails = this.allStudents.find((student) => student._id === studentId);
          if (studentDetails && !this.enrolledStudents.some((s) => s._id === studentDetails._id)) {
            this.enrolledStudents.push(studentDetails);
          }
        });
      }
    });
    console.log('Final enrolledStudents:', this.enrolledStudents);
    this._cdr.detectChanges();
  }

  ngOnDestroy(): void {
    this._subscription.unsubscribe();
    if (this.socket) {
      this.socket.disconnect();
    }
  }
}
