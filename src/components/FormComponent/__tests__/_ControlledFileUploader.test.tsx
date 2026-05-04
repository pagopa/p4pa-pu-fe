/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '../../../__tests__/renderers';
import { i18nTestSetup } from '../../../__tests__/i18nTestSetup';
import { useForm } from 'react-hook-form';
import { _ControlledFileUploader } from '../_ControlledFileUploader';

i18nTestSetup({});

type FormValues = { doc: File | null };

vi.mock('../../FileUploader/FileUploader', () => {
  const MockFileUploader = (props: any) => {
    const {
      description,
      disabled,
      file,
      fileExtensionsAllowed,
      setFile,
      setUploading,
      setProgress
    } = props;

    return (
      <div
        data-testid="mock-file-uploader"
        aria-disabled={disabled ? 'true' : 'false'}
      >
        <div data-testid="desc">{description}</div>
        <div data-testid="exts">{JSON.stringify(fileExtensionsAllowed)}</div>
        <div data-testid="current-file">
          {file ? (file as File).name : 'none'}
        </div>
        <button
          type="button"
          data-testid="select-file"
          onClick={() =>
            setFile(
              new File(['content'], 'new-file.pdf', { type: 'application/pdf' })
            )
          }
        >
          setFile
        </button>
        <button
          type="button"
          data-testid="start-upload"
          onClick={() => setUploading(true)}
        >
          startUpload
        </button>
        <button
          type="button"
          data-testid="set-progress"
          onClick={() => setProgress(50)}
        >
          setProgress
        </button>
      </div>
    );
  };

  return { default: MockFileUploader };
});

vi.mock('../ErrorMessage', () => ({
  ErrorMessage: ({ messageKey }: { messageKey?: string }) => (
    <span data-testid="error-msg">{messageKey ?? ''}</span>
  )
}));

describe('_ControlledFileUploader', () => {
  it('renders description, allowed extensions, and disabled state', () => {
    const Form = () => {
      const { control } = useForm<FormValues>({ defaultValues: { doc: null } });
      return (
        <_ControlledFileUploader<FormValues>
          name="doc"
          control={control}
          description="Upload a PDF"
          fileExtensionsAllowed={['pdf', 'png']}
          disabled
        />
      );
    };

    render(<Form />);

    expect(screen.getByTestId('mock-file-uploader')).toBeInTheDocument();
    expect(screen.getByTestId('desc')).toHaveTextContent('Upload a PDF');
    expect(screen.getByTestId('exts')).toHaveTextContent('["pdf","png"]');
    expect(screen.getByTestId('mock-file-uploader')).toHaveAttribute(
      'aria-disabled',
      'true'
    );
  });

  it('shows initial file value from RHF defaultValues', () => {
    const initial = new File(['x'], 'initial.png', { type: 'image/png' });

    const Form = () => {
      const { control } = useForm<FormValues>({
        defaultValues: { doc: initial }
      });
      return (
        <_ControlledFileUploader<FormValues>
          name="doc"
          control={control}
          description="desc"
          fileExtensionsAllowed={['png']}
        />
      );
    };

    render(<Form />);

    expect(screen.getByTestId('current-file')).toHaveTextContent('initial.png');
  });

  it('updates value when setFile is called', () => {
    const Form = () => {
      const { control } = useForm<FormValues>({ defaultValues: { doc: null } });
      return (
        <_ControlledFileUploader<FormValues>
          name="doc"
          control={control}
          description="desc"
          fileExtensionsAllowed={['pdf']}
        />
      );
    };

    render(<Form />);

    expect(screen.getByTestId('current-file')).toHaveTextContent('none');
    fireEvent.click(screen.getByTestId('select-file'));
    expect(screen.getByTestId('current-file')).toHaveTextContent(
      'new-file.pdf'
    );
  });

  it('shows ErrorMessage when fieldState.error is set', () => {
    const Form = () => {
      const { control, setError } = useForm<FormValues>({
        defaultValues: { doc: null }
      });

      return (
        <div>
          <_ControlledFileUploader<FormValues>
            name="doc"
            control={control}
            description="desc"
            fileExtensionsAllowed={['pdf']}
          />
          <button
            type="button"
            onClick={() =>
              setError('doc', { type: 'manual', message: 'upload.required' })
            }
          >
            trigger-error
          </button>
        </div>
      );
    };

    render(<Form />);

    expect(screen.getByTestId('error-msg')).toHaveTextContent('');
    fireEvent.click(screen.getByText('trigger-error'));
    expect(screen.getByTestId('error-msg')).toHaveTextContent(
      'upload.required'
    );
  });

  it('provides setUploading and setProgress without crashing', () => {
    // eslint-disable-next-line sonarjs/no-identical-functions
    const Form = () => {
      const { control } = useForm<FormValues>({ defaultValues: { doc: null } });
      return (
        <_ControlledFileUploader<FormValues>
          name="doc"
          control={control}
          description="desc"
          fileExtensionsAllowed={['pdf']}
        />
      );
    };

    render(<Form />);

    fireEvent.click(screen.getByTestId('start-upload'));
    fireEvent.click(screen.getByTestId('set-progress'));

    expect(screen.getByTestId('mock-file-uploader')).toBeInTheDocument();
  });
});
