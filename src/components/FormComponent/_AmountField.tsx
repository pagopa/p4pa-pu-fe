import EuroRoundedIcon from '@mui/icons-material/EuroRounded';

import { _TextField, _TextFieldProps } from './_TextField';

export const _AmountField = (props: _TextFieldProps) => (
  <_TextField icon={<EuroRoundedIcon />} {...props} />
);
