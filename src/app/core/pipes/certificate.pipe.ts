import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Pipe({
  name: 'safeUrl'
})
export class CertificatePipe implements PipeTransform {

  constructor(private _sanitizer: DomSanitizer) {}

  transform(url: string): SafeResourceUrl {
    return this._sanitizer.bypassSecurityTrustResourceUrl(url);
  }

}
