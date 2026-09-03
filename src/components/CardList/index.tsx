import { Stack } from '@mui/material';
import { GridSortModel } from '@mui/x-data-grid';
import { useTranslation } from 'react-i18next';
import { EmptyData } from '../DataGrid/CustomDataGrid';
import { usePagination } from '@core/hooks/usePagination';
import { HiddenDiv } from '../HiddenDiv';
import CustomPagination from '../DataGrid/CustomPagination';

export type CardListProps<T> = {
  rows: Array<T>;
  getRowId: (row: T) => string;
  renderCard: (row: T) => React.ReactNode;
  totalPages: number;
  initialPage?: number;
  initialPageSize?: number;
  pageSizeOptions?: Array<number>;
  initialSortModel?: GridSortModel;
  emptyTitle?: string;
  emptyDescription?: string;
};

const CardList = <T,>({
  rows,
  getRowId,
  renderCard,
  totalPages,
  initialPage,
  initialPageSize,
  pageSizeOptions = [5, 10, 20],
  initialSortModel,
  emptyTitle,
  emptyDescription
}: CardListProps<T>) => {
  const { t } = useTranslation();
  const {
    page,
    pageSize,
    announcement,
    handlePageChange,
    handlePageSizeChange
  } = usePagination({
    initialPage,
    initialPageSize,
    initialSortModel,
    totalPages,
    totalItems: rows.length
  });

  if (rows.length === 0) {
    return (
      <EmptyData
        title={emptyTitle ?? t('commons.noRows')}
        description={emptyDescription ?? ''}
      />
    );
  }

  return (
    <Stack spacing={2} role="region" aria-label={t('commons.tableResults')}>
      <HiddenDiv message={announcement} />
      <Stack spacing={1.5} role="list">
        {rows.map((row) => (
          <div key={getRowId(row)} role="listitem">
            {renderCard(row)}
          </div>
        ))}
      </Stack>
      <CustomPagination
        sizePageOptions={pageSizeOptions}
        defaultPageOption={pageSize}
        totalPages={totalPages}
        currentPage={page}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
      />
    </Stack>
  );
};

export default CardList;
