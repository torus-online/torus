import { DataSource } from '@angular/cdk/collections';
import { MatSort } from '@angular/material/sort';
import { map, expand, toArray, flatMap, mergeMap, startWith } from 'rxjs/operators';
import { Observable, EMPTY } from 'rxjs';
import { ShareholderModel } from '../../core/shareholder.model';
import { OrganizationContract } from 'src/app/core/organization-contract.interface';
import { OrganizationsService } from 'src/app/core/organizations.service';
import { CoreStateService } from 'src/app/core/core-state.service';

/**
 * Data source for the SharesDelete view. This class should
 * encapsulate all logic for fetching and manipulating the displayed data
 * (including sorting, pagination, and filtering).
 */
export class SharesDataSource extends DataSource<ShareholderModel> {
  sort: MatSort;

  constructor(
    private organizations: OrganizationsService,
    private coreState: CoreStateService,
  ) {
    super();
  }

  /**
   * Connect this data source to the table. The table will only update when
   * the returned stream emits new items.
   * @returns A stream of the items to be rendered.
   */
  connect(): Observable<ShareholderModel[]> {
    const data$ = this.coreState.organization$.pipe(
      flatMap(state => this.loadData$(state.contract))
    );

    return data$.pipe(
      flatMap(data => this.sort.sortChange.pipe(
        startWith([]),
        map(() => data)),
      ),
      map(data => this.getSortedData(data))
    );
  }

  /**
   *  Called when the table is being destroyed. Use this function, to clean up
   * any open connections or free any held resources that were set up during connect.
   */
  disconnect() {}

  private loadData$(contract: OrganizationContract): Observable<ShareholderModel[]> {
    return this.organizations.getOrganizationShareholders$(contract, 10).pipe(
      expand(result => result.isEndOfData
        ? EMPTY
        : this.organizations.getOrganizationShareholders$(
          contract,
          10,
          result.shareholders[result.shareholders.length -1].address),
      ),
      mergeMap(result => result.shareholders),
      toArray()
    );
  }

  /**
   * Paginate the data (client-side). If you're using server-side pagination,
   * this would be replaced by requesting the appropriate data from the server.
   */
  // private getPagedData(data: ShareholderModel[]) {
  //   const startIndex = this.paginator.pageIndex * this.paginator.pageSize;
  //   return data.splice(startIndex, this.paginator.pageSize);
  // }

  /**
   * Sort the data (client-side). If you're using server-side sorting,
   * this would be replaced by requesting the appropriate data from the server.
   */
  private getSortedData(data: ShareholderModel[]): ShareholderModel[] {
    if (!this.sort.active || this.sort.direction === '') {
      return data;
    }

    return data.sort((a, b) => {
      const isAsc = this.sort.direction === 'asc';
      switch (this.sort.active) {
        case 'name': return compare(a.name, b.name, isAsc);
        case 'shareCount': return compare(+a.shareCount, +b.shareCount, isAsc);
        default: return 0;
      }
    });
  }
}

/** Simple sort comparator for example ID/Name columns (for client-side sorting). */
function compare(a: string | number, b: string | number, isAsc: boolean) {
  return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
}
