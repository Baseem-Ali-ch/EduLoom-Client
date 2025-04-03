import { Component, OnInit } from '@angular/core';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { CommonModule } from '@angular/common';
import { CourseServiceService } from '../../../core/services/instructor/course.service.service';

interface Achievement {
  quizId: string;
  title: string;
  description: string;
  unlocked: boolean;
  unlockedDate?: string;
  course?: string; // Added to match quizResult structure
  totalMark?: number;
  totalQuestions?: number;
  percentage?: string;
}

@Component({
  selector: 'app-achivements',
  standalone: true,
  imports: [CommonModule, SidebarComponent],
  templateUrl: './achivements.component.html',
  styleUrls: ['./achivements.component.css'],
})
export class AchivementsComponent implements OnInit {
  achievements: Achievement[] = [];
  quizId: string = '';

  constructor(private _courseService: CourseServiceService) {}

  ngOnInit(): void {
    // Subscribe to quizId$ if it's used elsewhere, but not necessary for loading achievements here
    this._courseService.quizId$.subscribe((quizId) => {
      this.quizId = quizId || '';
    });
    this.loadAchievements();
  }

  // Load achievement statuses from local storage
  loadAchievements(): void {
    // Get all quiz results from local storage
    const quizKeys = Object.keys(localStorage).filter((key) => key.startsWith('quiz_'));

    // Populate achievements based on quiz results
    this.achievements = quizKeys.map((quizKey) => {
      const quizId = quizKey.replace('quiz_', '');
      const quizResult = localStorage.getItem(quizKey);
      const parsedResult = quizResult ? JSON.parse(quizResult) : null;

      // Check if an achievement exists for this quiz
      const achievementKey = `achievement_${quizId}`;
      const storedAchievement = localStorage.getItem(achievementKey);
      const parsedAchievement = storedAchievement ? JSON.parse(storedAchievement) : null;

      const unlocked = parsedAchievement?.unlocked || (parsedResult && parseFloat(parsedResult.percentage) >= 20);

      // If unlocked and no achievement is stored, save it
      if (unlocked && !storedAchievement && parsedResult) {
        const achievementData = {
          quizId: quizId,
          unlocked: true,
          unlockedDate: parsedResult.date,
        };
        localStorage.setItem(achievementKey, JSON.stringify(achievementData));
      }

      return {
        quizId: quizId,
        title: parsedResult?.course ? `${parsedResult.course} Quiz` : `Quiz ${quizId}`,
        description: parsedResult
          ? `Score ${parsedResult.totalMark}/${parsedResult.totalQuestions} (${parsedResult.percentage}%)`
          : 'Complete this quiz to unlock',
        unlocked: unlocked,
        unlockedDate: parsedAchievement?.unlockedDate || (unlocked && parsedResult?.date) || undefined,
        course: parsedResult?.course,
        totalMark: parsedResult?.totalMark,
        totalQuestions: parsedResult?.totalQuestions,
        percentage: parsedResult?.percentage,
      }
    });
  }
}