import { useEffect } from 'react';
import { BredcrumbItem } from '../../../components/Breadcrumbs/Breadcrumbs';
import { PageRoutes } from '../..';
import { generatePath, useParams } from 'react-router';
import { setCustomBreadcrumbsItems } from '../../../store/AppStateStore';
import { OperatorsDetail } from '../../../../generated/data-contracts';

export const useBreadcrumbs = ({
  isSuccess,
  data
}: {
  isSuccess: boolean;
  data: OperatorsDetail | undefined;
}) => {
  const { organizationId } = useParams();

  useEffect(() => {
    const breadcrumbs: Array<BredcrumbItem> = [];
    const orgName = data?.orgName;

    breadcrumbs.push({
      pathname: PageRoutes.OPERATORS_LIST,
      id: 'OPERATORS_LIST'
    });

    if (orgName) {
      breadcrumbs.push({
        pathname: generatePath(PageRoutes.BROKER_OPERATORS, {
          organizationId,
          orgName
        }),
        label: orgName,
        id: 'BROKER_OPERATORS'
      });
    }

    if (isSuccess) {
      breadcrumbs.push({
        pathname: '',
        label:
          data?.operatorName || data?.operatorLastName
            ? `${data?.operatorName || ''} ${data?.operatorLastName || ''}`
            : data?.operatorFiscalCode || data?.operatorId || '',
        id: 'OPERATORS_DETAIL'
      });
    }

    setCustomBreadcrumbsItems(breadcrumbs);
  }, [isSuccess, data, organizationId]);
};
