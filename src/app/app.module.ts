import 'hammerjs';

import {NgModule}      from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

import {AppComponent}  from './app.component';
import {ResearchModule} from './research/research.module';
import {PingComponent} from './toolbar/ping.component';
import {CoreModule} from './core/core.module';
import {SettingsModule} from './settings/settings.module';
import {ObjectdetailsModule} from './objectdetails/objectdetails.module';
import {AppRoutingModule} from './app-routing.module';
import {EvaluationModule} from './evaluation/evaluation.module';
import {MaterialModule} from './material.module';
import {ResultsModule} from './results/results.module';



@NgModule({
  imports: [
      CoreModule,
      BrowserModule,
      MaterialModule,
      BrowserAnimationsModule,
      FormsModule,
      AppRoutingModule,
      ResultsModule,
      EvaluationModule,
      ObjectdetailsModule,
      ResearchModule,
      SettingsModule,
  ],
  declarations: [ AppComponent, PingComponent ],
  providers:    [ ],
  bootstrap:    [ AppComponent ]
})

export class AppModule { }
