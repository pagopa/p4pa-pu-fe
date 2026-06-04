import { styled } from '@mui/material/styles';

// Hidden div
const Div = styled('div')({
  position: 'absolute',
  left: '-10000px',
  width: '1px',
  height: '1px',
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)'
});

export const HiddenDiv = ({ message }: { message: string }) => {
  return (
    <Div role="status" aria-live="polite" aria-atomic="true">
      {message}
    </Div>
  );
};
