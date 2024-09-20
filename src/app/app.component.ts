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







// import { Component, OnInit, ViewChild } from '@angular/core';
// import { FormBuilder, FormGroup } from '@angular/forms';
// import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
// import { Observable, of } from 'rxjs';
// import { catchError, map, startWith, switchMap } from 'rxjs/operators';
// import { DataService } from './data.service';

// @Component({
//   selector: 'app-root',
//   templateUrl: './app.component.html',
//   styleUrls: ['./app.component.css']
// })
// export class AppComponent implements OnInit {
//   formGroup: FormGroup;
//   options: { id: number, name: string }[] = [];
//   filteredOptions: { id: number, name: string }[] = [];
//   isLoading = false;
//   currentPage = 1;
//   perPage = 10;

//   @ViewChild(CdkVirtualScrollViewport) virtualScroll!: CdkVirtualScrollViewport;

//   constructor(private dataService: DataService, private fb: FormBuilder) {
//     this.formGroup = this.fb.group({
//       employee: [''] // Define the form control within the form group
//     });
//   }

//   ngOnInit() {
//     this.initForm();
//     this.fetchNames('');
//   }

//   initForm() {
//     this.formGroup.get('employee')?.valueChanges.pipe(
//       startWith(''),
//       map(value => value || ''), // Convert null to empty string
//       switchMap(value => this.fetchNames(value))
//     ).subscribe(filtered => {
//       this.filteredOptions = filtered;
//     });
//   }

//   fetchNames(searchTerm: string): Observable<{ id: number, name: string }[]> {
//     if (this.isLoading) return of(this.filteredOptions); // Prevent multiple calls if already loading

//     this.isLoading = true;

//     if(searchTerm){
//       this.filteredOptions = []
//       this.currentPage = 1
//     }
//     return this.dataService.getNames(searchTerm, this.currentPage, this.perPage).pipe(
//       map(data => {
//         if (this.currentPage === 1) {
//           // Reset options if it's the first page
//           this.options = data;
//         } else {
//           // Append more data if scrolling for more results
//           this.options = [...this.options, ...data];
//         }
//         this.isLoading = false;
//         this.filteredOptions = this.options; // Update filtered options here
//         return this.options;
//       }),
//       catchError(() => {
//         this.isLoading = false;
//         return of(this.options); // Return current options in case of error
//       })
//     );
//   }

//   onScrollEnd() {
//     if (this.virtualScroll) {
//       const end = this.virtualScroll.measureScrollOffset('bottom');
//       if (end < 100 && !this.isLoading) { // Trigger when scrolled near the bottom
//         this.currentPage++;
//         this.fetchNames(this.formGroup.get('employee')?.value || '').subscribe();
//       }
//     }
//   }

//  // Reset the virtual scroll position when the dropdown is opened
//  onDropdownOpened() {
//   console.log("opened")
//   if (this.virtualScroll) {
//     console.log(this.virtualScroll)
//     this.virtualScroll.scrollToIndex(0); // Reset scroll position to the top
//   }
// }

//   displayFn(option: { id: number, name: string }): string {
//     return option ? option.name : '';
//   }

//   onOptionSelected(event: any) {
//     const selectedOption = event.option.value;
//     console.log('Selected Option:', selectedOption);
//     // You can perform actions with the selectedOption here
//   }
// }


















import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { DataService } from './data.service';
import { debounceTime, switchMap, tap } from 'rxjs/operators';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';

import { of } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  // employeeControl = new FormControl();
  options: { id: number, name: string }[] = [];
  isLoading = false;
  page = 1;  // Track the current page number
  perPage = 10;  // Number of items per page
  searchTerm = '';  // Search term for filtering
  totalResults = 0;  // Total results from the server

  formGroup: FormGroup;

  constructor(private dataService: DataService,  private fb: FormBuilder) {
    this.formGroup = this.fb.group({
            employee: ['', [Validators.required, this.employeeValidator.bind(this)]]
          });
  }

  ngOnInit() {
    this.initAutocomplete();
  }

  // Initialize autocomplete functionality
  initAutocomplete() {
    this.formGroup.get("employee")?.valueChanges.pipe(
      debounceTime(300),  // Wait for user to stop typing
      tap((searchTerm: any) => {
        // Reset data on new search
        this.searchTerm = searchTerm.name ? searchTerm.name : searchTerm;
        this.page = 1;
        this.options = [];
        this.fetchNames();
      })
    ).subscribe();
  }

  fetchNames() {
    if (!this.isLoading) {
      this.isLoading = true;
      this.dataService.getNames(this.searchTerm, this.page, this.perPage).subscribe(data => {
        if (data.length > 0) {
          this.options = [...this.options, ...data];  // Append new data to the existing list
          this.page++;  // Increase the page number for the next batch
        }
        this.isLoading = false;
      });
    }
  }

    // Validator for person autocomplete (must select from predefined list)
    employeeValidator(control: AbstractControl): ValidationErrors | null {
    const selectedEmployee = this.options.find(fsn => fsn.name === control.value?.name);;
    if (selectedEmployee) {
      return null;  // valid
    }
    return { invalidEmployee: true };  // invalid
  }
  

  onDropOpened() {
    if (this.options.length === 0) {
      this.page = 1;
      this.fetchNames();
    }
  }
  

  onScroll(event: any) {
    const bottomReached = event.target.scrollHeight - event.target.scrollTop <= event.target.clientHeight + 1;  // Allow some tolerance
    if (bottomReached && !this.isLoading) {
      this.fetchNames();
    }
  }
  

  // Handle option selection
  onOptionSelected(event: any) {
    console.log('Selected option:', typeof event.option.value);
  }

    displayFn(option: { id: number, name: string }): string {
      console.log(option)
    return option ? option.name : '';
  }

    isFieldInvalid(field: string): any {
    const control = this.formGroup.get(field);
    return control?.invalid && (control.touched || control.dirty);
  }

    onSubmit() {
    if (this.formGroup.valid) {
      console.log('Form Submitted', this.formGroup.value);
    } else {
      console.log('Form is not valid');
    }
  }
}
