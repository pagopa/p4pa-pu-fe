import { useNavigate, useParams } from 'react-router';
import { useStore } from '../../../store/GlobalStore';
import spontaneousFormApi from '../../../api/spontaneousForm';
import { PageRoutes } from '../..';
import { SpontaneousFormCreateData } from '../SpontaneousFormForm/schemas/spontaneousFormCreateSchema';
import SpontaneousFormForm from '../SpontaneousFormForm/SpontaneousFormForm';

const SpontaneousFormEdit = () => {
  const navigate = useNavigate();
  const { spontaneousFormId } = useParams<{ spontaneousFormId: string }>();

  const {
    state: { organizationId }
  } = useStore();

  const { data, isLoading } = spontaneousFormApi.getSpontaneousFormById({
    organizationId: Number(organizationId),
    spontaneousFormId: Number(spontaneousFormId)
  });

  const updateMutation = spontaneousFormApi.updateSpontaneousForm({
    organizationId: Number(organizationId)
  });

  const formDetail = data?.response;

  const handleSubmit = async (formData: SpontaneousFormCreateData) => {
    try {
      await updateMutation.mutateAsync({
        organizationId: Number(organizationId),
        spontaneousFormId: Number(spontaneousFormId),
        code: formData.code.trim(),
        structure: JSON.parse(formData.structure),
        dictionary: formData.dictionary?.trim()
          ? JSON.parse(formData.dictionary)
          : undefined
      });

      navigate(PageRoutes.RESPONSES_SUCCESS, {
        state: {
          category: 'spontaneous-form-edit',
          i18nParams: { formCode: formData.code.trim() }
        }
      });
    } catch {
      navigate(PageRoutes.RESPONSES_ERROR, {
        state: {
          errorType: 'spontaneous-form-edit'
        }
      });
    }
  };

  const handleCancel = () => {
    navigate(PageRoutes.SPONTANEOUS_FORM_INDEX);
  };

  if (isLoading || !formDetail) {
    return null;
  }

  const initialData = {
    code: formDetail.code,
    structure: JSON.stringify(formDetail.structure, null, 2),
    dictionary: formDetail.dictionary
      ? JSON.stringify(formDetail.dictionary, null, 2)
      : ''
  };

  return (
    <SpontaneousFormForm
      mode="edit"
      initialData={initialData}
      isPending={updateMutation.isPending}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
    />
  );
};

export default SpontaneousFormEdit;
