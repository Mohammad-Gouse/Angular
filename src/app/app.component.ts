// import { Component } from '@angular/core';
// import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
// import { Observable, startWith, map } from 'rxjs';

// @Component({
//   selector: 'app-root',
//   templateUrl: './app.component.html',
//   styleUrls: ['./app.component.scss']
// })
// export class AppComponent {
//   myForm: FormGroup;

//   // Options for first autocomplete
//   options: string[] = ['Apple', 'Banana', 'Orange', 'Mango', 'Grapes'];

//   // Options for second autocomplete (name, id pair)
//   peopleOptions = [
//     { id: 1, name: 'John Doe' },
//     { id: 2, name: 'Jane Smith' },
//     { id: 3, name: 'Robert Johnson' },
//     { id: 4, name: 'Emily Davis' }
//   ];

//   filteredOptions: Observable<string[]> | undefined;
//   filteredPeopleOptions: Observable<{ id: number, name: string }[]> | undefined;

//   constructor(private fb: FormBuilder) {
//     this.myForm = this.fb.group({
//       name: ['', [Validators.required, Validators.minLength(3)]],
//       email: ['', [Validators.required, Validators.email]],
//       age: ['', [Validators.required, Validators.min(18), Validators.max(65)]],
//       fruit: ['', [Validators.required, this.fruitValidator.bind(this)]], // Autocomplete 1 with string list
//       person: ['', [Validators.required, this.personValidator.bind(this)]] // Autocomplete 2 (name display, id as value)
//     });
//   }

//   ngOnInit() {
//     // First autocomplete filter
//     this.filteredOptions = this.myForm.get('fruit')!.valueChanges.pipe(
//       startWith(''),
//       map(value => this._filter(value || ''))
//     );

//     // Second autocomplete filter (for person - name/id)
//     this.filteredPeopleOptions = this.myForm.get('person')!.valueChanges.pipe(
//       startWith(''),
//       map(value => this._filterPeople(value || ''))
//     );
//   }

//   private _filter(value: string): string[] {
//     const filterValue = value.toLowerCase();
//     return this.options.filter(option => option.toLowerCase().includes(filterValue));
//   }

//   private _filterPeople(value: string): { id: number, name: string }[] {
//     const filterValue = value.toLowerCase();
//     return this.peopleOptions.filter(option => option.name.toLowerCase().includes(filterValue));
//   }

//   // Validator for fruit autocomplete
//   fruitValidator(control: AbstractControl): ValidationErrors | null {
//     if (this.options.includes(control.value)) {
//       return null;  // valid
//     }
//     return { invalidFruit: true };  // invalid
//   }

//   // Validator for person autocomplete (must select from predefined list)
//   personValidator(control: AbstractControl): ValidationErrors | null {
//     const selectedPerson = this.peopleOptions.find(person => person.name === control.value);
//     if (selectedPerson) {
//       return null;  // valid
//     }
//     return { invalidPerson: true };  // invalid
//   }

//   onSubmit() {
//     if (this.myForm.valid) {
//       console.log('Form Submitted', this.myForm.value);
//     } else {
//       console.log('Form is not valid');
//     }
//   }

//   isFieldInvalid(field: string): any {
//     const control = this.myForm.get(field);
//     return control?.invalid && (control.touched || control.dirty);
//   }
// }







import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { Observable, of } from 'rxjs';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';
import { DataService } from './data.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  formGroup: FormGroup;
  options: { id: number, name: string }[] = [];
  filteredOptions: { id: number, name: string }[] = [];
  isLoading = false;
  currentPage = 1;
  perPage = 20;

  @ViewChild(CdkVirtualScrollViewport) virtualScroll: CdkVirtualScrollViewport | undefined;

  constructor(private dataService: DataService, private fb: FormBuilder) {
    this.formGroup = this.fb.group({
      employee: [''] // Define the form control within the form group
    });
  }

  ngOnInit() {
    this.initForm();
    this.fetchNames('');
  }

  initForm() {
    this.formGroup.get('employee')?.valueChanges.pipe(
      startWith(''),
      map(value => value || ''), // Convert null to empty string
      switchMap(value => this.fetchNames(value))
    ).subscribe(filtered => {
      this.filteredOptions = filtered;
    });
  }

  fetchNames(searchTerm: string): Observable<{ id: number, name: string }[]> {
    if (this.isLoading) return of(this.filteredOptions); // Prevent multiple calls if already loading

    this.isLoading = true;

    if(searchTerm){
      this.filteredOptions = []
      this.currentPage = 1
    }
    return this.dataService.getNames(searchTerm, this.currentPage, this.perPage).pipe(
      map(data => {
        if (this.currentPage === 1) {
          // Reset options if it's the first page
          this.options = data;
        } else {
          // Append more data if scrolling for more results
          this.options = [...this.options, ...data];
        }
        this.isLoading = false;
        this.filteredOptions = this.options; // Update filtered options here
        return this.options;
      }),
      catchError(() => {
        this.isLoading = false;
        return of(this.options); // Return current options in case of error
      })
    );
  }

  onScrollEnd() {
    if (this.virtualScroll) {
      const end = this.virtualScroll.measureScrollOffset('bottom');
      if (end < 100 && !this.isLoading) { // Trigger when scrolled near the bottom
        this.currentPage++;
        this.fetchNames(this.formGroup.get('employee')?.value || '').subscribe();
      }
    }
  }

  displayFn(option: { id: number, name: string }): string {
    return option ? option.name : '';
  }

  onOptionSelected(event: any) {
    const selectedOption = event.option.value;
    console.log('Selected Option:', selectedOption);
    // You can perform actions with the selectedOption here
  }
}
