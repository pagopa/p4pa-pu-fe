import { useNavigate } from 'react-router';
import { AxiosError } from 'axios';
import { UseFormSetError } from 'react-hook-form';
import { useStore } from '../../../store/GlobalStore';
import spontaneousFormApi from '../../../api/spontaneousForm';
import { PageRoutes } from '../..';
import { SpontaneousFormCreateData } from '../SpontaneousFormForm/schemas/spontaneousFormCreateSchema';
import SpontaneousFormForm from '../SpontaneousFormForm/SpontaneousFormForm';

const SpontaneousFormCreate = () => {
  const navigate = useNavigate();

  const {
    state: { organizationId }
  } = useStore();

  const createMutation = spontaneousFormApi.createSpontaneousForm({
    organizationId: Number(organizationId)
  });

  const handleSubmit = async (
    formData: SpontaneousFormCreateData,
    setError?: UseFormSetError<SpontaneousFormCreateData>
  ) => {
    try {
      await createMutation.mutateAsync({
        organizationId: Number(organizationId),
        code: formData.code.trim(),
        structure: JSON.parse(formData.structure),
        dictionary: formData.dictionary?.trim()
          ? JSON.parse(formData.dictionary)
          : undefined
      });

      navigate(PageRoutes.RESPONSES_SUCCESS, {
        state: {
          category: 'spontaneous-form-create',
          i18nParams: { formCode: formData.code.trim() }
        }
      });
    } catch (error) {
      if (
        error instanceof AxiosError &&
        error.response?.status === 409 &&
        setError
      ) {
        setError('code', {
          type: 'manual',
          message: 'spontaneousForm.create.errors.codeAlreadyExists'
        });
      } else {
        navigate(PageRoutes.RESPONSES_ERROR, {
          state: {
            errorType: 'spontaneous-form-create'
          }
        });
      }
    }
  };

  const handleCancel = () => {
    navigate(PageRoutes.SPONTANEOUS_FORM_INDEX);
  };

  return (
    <SpontaneousFormForm
      mode="create"
      isPending={createMutation.isPending}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
    />
  );
};

export default SpontaneousFormCreate;
