import { __ } from './utils/Helpers';

import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { Tabs, ConfigProvider, Button } from 'antd';
import { SettingOutlined, ClockCircleOutlined, StarOutlined, ExportOutlined, TagOutlined, FormOutlined, SaveOutlined } from '@ant-design/icons';
import useStore from './store';

// import { onCLS, onLCP } from 'web-vitals'; 

import General from './components/General';
import Review from './components/Review';
import ReviewReminder from './components/ReviewReminder';
import ExportImportReviews from './components/ExportImportReviews';
import Coupon from './components/Coupon';
import OptionalFields from './components/OptionalFields';

// import 'antd/dist/antd.css';
import './assets/styles/override-ant.scss'
import './assets/styles/App.css'


// function reportWebVitals(metric) {
//   console.log(`${metric.name}:`, metric.value);
// }
// onCLS(reportWebVitals);
// onLCP(reportWebVitals);
const items = [
  {
    label: (<>
    <div><SettingOutlined /></div>
    <div>{ __('general') }</div>
    </>),
    children: <General />
  },
  {
    label: (<>
      <div><StarOutlined /></div>
      <div>{ __('review') }</div>
      </>),
    children: <Review />,
  },
  {
    label: (<>
      <div><TagOutlined /></div>
      <div>{ __('coupon') }</div>
      </>),
    children: <Coupon />,
  },
  {
    label: (<>
      <div><ClockCircleOutlined /></div>
      <div>{ __('review_reminder') }</div>
      </>),
    children: <ReviewReminder />,
  },
  {
    label: (<>
      <div><FormOutlined /></div>
      <div>{ __('optional_fields') }</div>
      </>),
    children: <OptionalFields />,
  },
  {
    label: (<>
      <div><ExportOutlined /></div>
      <div>{ __('export_import_reviews') }</div>
      </>),
    children: <ExportImportReviews />,
  }
  ].map((item, index) => ({
  ...item,
  key: (index + 1).toString()
}));
const App = () => {
  const { 
    setTriggerSaveGeneral,
    setTriggerSaveReviews,
    setTriggerSaveCoupon,
    setTriggerSaveReviewReminder,
    setTriggerSaveOptionalFields,
    loadingSaveButton,
    setLoadingSaveButton
  } = useStore();
  const [activeTab, setActiveTab] = React.useState("1");

  const handleSave = () => {
    setLoadingSaveButton(true);
    // Trigger save based on active tab
    switch (activeTab) {
      case "1": // General
        setTriggerSaveGeneral(true);
        break;
      case "2": // Review
        setTriggerSaveReviews(true);
        break;
      case "3": // Coupon
        setTriggerSaveCoupon(true);
        break;
      case "4": // Review Reminder
        setTriggerSaveReviewReminder(true);
        break;
      case "5": // Optional Fields
        setTriggerSaveOptionalFields(true);
        break;
      default:
        setLoadingSaveButton(false);
        return;
    }
  };

  const extraContent = (
    <Button 
      type="primary"
      icon={<SaveOutlined />}
      onClick={handleSave}
      loading={loadingSaveButton}
      style={{ margin: '0 10px' }}
    >
      {__('save')}
    </Button>
  );

  return (
    <Tabs 
      defaultActiveKey="1" 
      items={items} 
      onChange={(key) => setActiveTab(key)}
      tabBarExtraContent={activeTab !== "6" ? extraContent : null}
    />
  );
};

const mount_node = document.getElementById('yay-reviews-settings')
if(mount_node) {
  ReactDOM.createRoot(mount_node).render(
    <ConfigProvider prefixCls="yayrv">
      <App />
    </ConfigProvider>
  );
}