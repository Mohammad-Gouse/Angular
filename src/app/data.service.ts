import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  constructor(private http: HttpClient) {}

  // Get names with search term, pagination
  getNames(searchTerm: string, page: number, perPage: number): Observable<{ id: number, name: string }[]> {
    let params = new HttpParams()
      .set('search', searchTerm)
      .set('page', page.toString())
      .set('limit', perPage.toString());

    return this.http.get<any[]>('http://localhost:3000/api/employees/name', { params })
      .pipe(
        map(response => response.map(item => ({
          id: item.id,
          name: item.name
        })))
      );
  }
}
