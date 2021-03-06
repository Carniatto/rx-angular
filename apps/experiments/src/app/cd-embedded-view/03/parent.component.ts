import { Component } from '@angular/core';
import { environment } from '../../../environments/environment';
import { merge, Observable, Subject } from 'rxjs';
import { map, scan, share } from 'rxjs/operators';

const rand = (n: number = 2): number => {
  // tslint:disable-next-line:no-bitwise
  return ~~(Math.random() * n);
};
const immutableIncArr = (n: number = 10) => (o$: Observable<number>) => o$.pipe(
  scan((a, i, idx) => {
    if(i === 1) {
      a[idx % n] = { id: idx % n, value: rand() };
    } else if(i === 0) {
      const id = rand(a.length);
      a[id] = { id, value: rand() };
    } else {
      a.splice(idx % n, 1);
    }
    return a;
  }, [])
);
const mutableIncArr = (n: number = 10) => {
  return (o$: Observable<number>) => o$.pipe(
    scan((a, i, idx) => {
      a[idx % n].value = rand();
      return a;
    }, [])
  );
}

const immutableArr = (n: number = 10) => (o$: Observable<number>) => o$.pipe(
  map(v => Array(n).fill(0).map((_, idx) => ({ id: idx % n, value: rand() })))
);

const mutableArr = (n: number = 10) => {
  const arr = Array(n);
  return (o$: Observable<number>) => o$.pipe(
    map(v => arr.forEach((i, idx) => i.value = rand()))
  );
}

@Component({
  selector: 'app-cd-embedded-view-parent03',
  template: `
    <h2>
      CD EmbeddedView 03
      <renders></renders>
    </h2>

    <button mat-raised-button (click)="trackById({})">
      CD
    </button>
    <button mat-raised-button [unpatch] (click)="changeOneClick$.next(1)">
      add
    </button>
    <button mat-raised-button [unpatch] (click)="changeOneClick$.next(0)">
      update
    </button>
    <button mat-raised-button [unpatch] (click)="changeOneClick$.next(-1)">
      remove
    </button>

    <button mat-raised-button [unpatch] (click)="changeAllClick$.next(10)">
      Change all
    </button>

    <div class="row">
      <div class="col">
        <h3>Native Angular</h3>
        <ng-container *ngFor="let i of array$ | async; trackBy: trackById">
          <renders></renders>
          -
          <mat-icon>{{i.value ? 'check' : 'highlight_off'}}</mat-icon>
          <br/>
        </ng-container>
      </div>
      <div class="col">
        <h3>rxFor - push based</h3>
        <ng-container *poc1For="array$; let i; trackBy: 'id'">
          <renders></renders>
          -
          <mat-icon>{{i.value ? 'check' : 'highlight_off'}}</mat-icon>
          <br/>
        </ng-container>
      </div>
      <div class="col">
        <h3>rxFor - trackBy</h3>
        <ng-container *poc2For="array$; let i; trackBy: 'id'">
          <renders></renders>
          -
          <mat-icon>{{i.value ? 'check' : 'highlight_off'}}</mat-icon>
          <br/>
        </ng-container>
      </div>
      <div class="col">
        <h3>rxFor - trackBy, distinctBy</h3>
        <ng-container *poc2For="array$; let i; trackBy: 'id'; distinctBy: distinctBy">
          <renders></renders>
          -
          <mat-icon>{{i.value ? 'check' : 'highlight_off'}}</mat-icon>
          <br/>
        </ng-container>
      </div>
      <div class="col">
        <h3>rxFor - iterable, trackByFn</h3>
        <ng-container *pocForIterable="array$; let i; trackBy: trackById">
          <renders></renders>
          -
          <mat-icon>{{i.value ? 'check' : 'highlight_off'}}</mat-icon>
          <br/>
        </ng-container>
      </div>
    </div>
  `,
  styles: [`
    .row {
      display: flex;
    }

    .col {
      width: 25%;
    }

  `],
  changeDetection: environment.changeDetection
})
export class CdEmbeddedViewParent03Component {
  changeOneClick$ = new Subject<number>();
  changeAllClick$ = new Subject<number>();

  array$ = merge(
    this.changeOneClick$.pipe(immutableIncArr()),
    this.changeAllClick$.pipe(immutableArr()),
  ).pipe(
    share()
  );

  trackById = i => i.id;
  distinctBy = (a, b) => a.value === b.value;
}
