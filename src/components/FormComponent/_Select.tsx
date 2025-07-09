import MenuItem, { MenuItemProps } from '@mui/material/MenuItem';
import TextField, { TextFieldProps } from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import { ChangeEvent, useEffect, useRef, useState } from 'react';

export type SelectOptions = Array<
  MenuItemProps & {
    label: string;
    flagMandatoryDueDate?: boolean;
  }
>;

export type _SelectProps = Omit<TextFieldProps, 'select' | 'type'> & {
  options?: SelectOptions;
  forwardRef?: React.Ref<HTMLInputElement>;
};

const RenderValue = ({
  selected,
  options
}: {
  selected: string;
  options: SelectOptions;
}) => {
  const labelRef = useRef<HTMLSpanElement>(null);
  const [isOverflowed, setIsOverflowed] = useState(false);

  const label =
    options.find((opt) => opt.value === selected)?.label || selected;

  useEffect(() => {
    const el = labelRef.current;
    if (el) {
      setIsOverflowed(el.scrollWidth > el.clientWidth);
    }
  }, [label]);

  const labelElement = (
    <span
      ref={labelRef}
      style={{
        display: 'block',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        maxWidth: '100%'
      }}
    >
      {label}
    </span>
  );

  return isOverflowed ? (
    <Tooltip title={label} enterDelay={500} arrow placement="top">
      {labelElement}
    </Tooltip>
  ) : (
    labelElement
  );
};

export const _Select = ({
  forwardRef,
  options = [],
  ...props
}: _SelectProps) => {
  const [value, setValue] = useState('');

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  };

  return (
    <TextField
      fullWidth
      size="small"
      data-testid={props.id}
      label={props.label}
      value={value}
      onChange={onChange}
      ref={forwardRef}
      {...props}
      select
      SelectProps={{
        ...props.SelectProps,
        renderValue: (selected) => (
          <RenderValue selected={selected as string} options={options} />
        )
      }}
    >
      {options.map((option, index) => {
        // Filter the custom props to avoid React warning
        // "React does not recognize the `flagMandatoryDueDate` prop on a DOM element"
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { label, flagMandatoryDueDate, ...menuItemProps } = option;

        return (
          <MenuItem
            key={`${props.label}-${option.value}-${index}`}
            {...menuItemProps}
          >
            {option.label}
          </MenuItem>
        );
      })}
    </TextField>
  );
};
