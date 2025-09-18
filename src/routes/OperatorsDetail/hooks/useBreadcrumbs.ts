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
  const { organizationId, orgName } = useParams();

  useEffect(() => {
    const breadcrumbs: Array<BredcrumbItem> = [];

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
        label: `${data?.operatorName} ${data?.operatorLastName}`,
        id: 'OPERATORS_DETAIL'
      });
    }

    setCustomBreadcrumbsItems(breadcrumbs);
  }, [orgName, isSuccess]);
};
