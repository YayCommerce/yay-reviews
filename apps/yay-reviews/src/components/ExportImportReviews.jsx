import { Tabs } from 'antd';
import { ConfigProvider } from 'antd';
import { __ } from "../utils/Helpers";

import ExportReviews from './ExportReviews';
import ImportReviews from './ImportReviews';

const items = [
    {
      label: __('export'),
      children: <ExportReviews />,
    },
    {
      label: __('import'),
      children: <ImportReviews />,
    }
    ].map((item, index) => ({
    ...item,
    key: (index + 1).toString()
  }));

const ExportImportReviews = () => (
    <>
      <Tabs defaultActiveKey="1" items={items} />
    </>
  );
  export default ExportImportReviews;