import { useTranslation } from 'react-i18next';
import { Stack } from '@mui/material';
import WizardStepWrapper from '../../../components/Wizard/WizardStepWrapper';

export type Step3Props = {
  editmode?: boolean;
};

export const Step3AssignChapter = ({ editmode = false }: Step3Props) => {
  const { t } = useTranslation();

  return (
    <WizardStepWrapper>
      <Stack direction="column" gap={2} alignItems="left" width="100%">
        {/* TODO: Implementare l'interfaccia per l'assegnazione del capitolo */}
        <div data-testid="assign-chapter-placeholder">
          {/* Contenuto temporaneo per il terzo step */}
          Placeholder per assegnazione capitolo
        </div>
      </Stack>
    </WizardStepWrapper>
  );
};
