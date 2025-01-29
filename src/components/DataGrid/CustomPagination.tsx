import { Box, Select, MenuItem, useTheme, Pagination } from '@mui/material';
import { useEffect, useState } from 'react';

type CustomPaginationProps = {
  sizePageOptions?: number[];
  defaultPageOption?: number;
  totalPages?: number;
};

const CustomPagination = ({ sizePageOptions = [10, 20, 30], defaultPageOption = 10, totalPages }: CustomPaginationProps) => {
  const theme = useTheme();
  const [hidePreviousButton, setHidePreviousButton] = useState(false);
  const [hideNextButton, setHideNextButton] = useState(false);
  const [page, setPage] = useState(1);

  const handlePage = (_event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const hideButtons = (page: number) => {
    if(page === 1) {
      setHidePreviousButton(true);
    }
    else if(page === totalPages) setHideNextButton(true);
    else {
      setHidePreviousButton(false);
      setHideNextButton(false);
    }
  };

  useEffect(() => {
    hideButtons(page);
  }, [page]);

  return (
    <Box
      display='flex'
      justifyContent='space-between'
      alignItems='center'
      width='100%'
      bgcolor={theme.palette.grey[200]}
      paddingTop={2}
    >
      <Select
        value={defaultPageOption}
        onChange={() => console.log('')}
        size='small'
        sx={{
          backgroundColor: theme.palette.background.paper
        }}
      >
        {sizePageOptions && sizePageOptions.map((size) => (
          <MenuItem key={size} value={size}>
            {size}
          </MenuItem>
        ))}
      </Select>

      <Pagination
        variant="text"
        defaultPage={1}
        siblingCount={1}
        boundaryCount={0}
        count={totalPages}
        hidePrevButton={hidePreviousButton}
        hideNextButton={hideNextButton}
        onChange={handlePage}
      />
    </Box>
  );
};

export default CustomPagination;
