import { List, Stack, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { getTransfers } from '../../api/transfers';
import { moneyFormat } from '../../utils/formatters';
import { TransferDTO } from '../../../generated/data-contracts';
import { Drawer, DrawerProps } from '../Drawer';

export type InstallmentDetailDrawerProps = DrawerProps & {
  organizationId: number;
  installmentId: number;
};

export const InstallmentDetailDrawer = ({
  organizationId,
  installmentId,
  ...drawerProps
}: InstallmentDetailDrawerProps) => {
  const { t } = useTranslation();

  const { data: transfers, isSuccess } = getTransfers(
    organizationId,
    installmentId
  );

  const Details = ({ transfer }: { transfer: TransferDTO }) => {
    // TODO: handle missing value
    if (
      !transfer?.amountCents ||
      !transfer?.category ||
      !transfer?.orgFiscalCode
    ) {
      return null;
    }

    return (
      <List key={transfer.transferId}>
        <Drawer.Field
          id="name"
          label=""
          variant="overline"
          value={transfer?.orgName ? transfer.orgName.toUpperCase() : ' - '}
        />
        <Drawer.Field
          id="importo"
          label="importo"
          variant="sidenav"
          value={moneyFormat(transfer.amountCents)}
        />
        <Drawer.Field
          id="fiscalCode"
          label="Codice fiscale"
          value={transfer.orgFiscalCode}
        />
        <Drawer.Field id="iban" label="IBAN" value={transfer?.iban ?? ' _ '} />
        <Drawer.Field
          id="postalCode"
          label="Conto Corrente Postale"
          value={transfer?.postalIban ?? ' _ '}
        />
        <Drawer.Field
          id="taxCode"
          label="Codice Tassonomico"
          variant="sidenav"
          value={transfer.category}
        />
      </List>
    );
  };

  const TransfersDetails = () => {
    if (!isSuccess || !transfers?.length) return null;

    return (
      <>
        {transfers.map((transfer) => (
          <Details key={transfer.transferId} transfer={transfer} />
        ))}
      </>
    );
  };

  return (
    <Drawer {...drawerProps}>
      <Stack gap={2.5}>
        <Typography variant="body2" fontSize={14}>
          {t('debtPositionInstallmentDetail.drawer.info')}
        </Typography>
        <TransfersDetails />
      </Stack>
    </Drawer>
  );
};
