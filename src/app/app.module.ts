import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { PosenetComponent } from './posenet/posenet.component';
import { WebcamModule } from 'ngx-webcam';
import { ObjectDetectionComponent } from './object-detection/object-detection.component';
import { CarlPoleComponent } from './carl-pole/carl-pole.component';

@NgModule({
  declarations: [
    AppComponent,
    PosenetComponent,
    ObjectDetectionComponent,
    CarlPoleComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    WebcamModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
