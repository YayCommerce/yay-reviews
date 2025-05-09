import React, { useEffect } from 'react';
import { Button, message, Form, Select, DatePicker, Row, Col } from 'antd';
import AjaxSelect from '../utils/AjaxSelect';
import { __ } from "../utils/Helpers";
import { productFetchOptions, categoryFetchOptions } from '../fetchOptions';
import useStore from '../store';

const ExportReviews = () => {
    const [form] = Form.useForm();
    const { exportReviews, setExportReviews } = useStore((state) => ({
        exportReviews: state.exportReviews,
        setExportReviews: state.setExportReviews,
    }));

    const [loading, setLoading] = React.useState(false);
    
    useEffect(() => {
        const initialValues = {
            date_range: '',
            ratings: [1, 2, 3, 4, 5],
            status: ['approved']
        };
        
        setExportReviews(initialValues);
        form.setFieldsValue(initialValues);
    }, []);

    const exportNow = () => {
        setLoading(true);
        fetch(yay_reviews_data.rest_url + '/export-reviews', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-WP-Nonce': yay_reviews_data.rest_nonce
            },
            body: JSON.stringify({ fields: exportReviews }),
        })
        .then(response => response.json())
        .then(data => {
            setLoading(false);
            if (data.success) {
                var currentDate = new Date().toISOString().slice(0, 10);

                var blob = new Blob([data.data], { type: 'text/csv' });
                var link = document.createElement('a');
                link.href = window.URL.createObjectURL(blob);
                link.download = 'yay_reviews_' + currentDate + '.csv';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            } else {
                message.error(__('error_prefix') + data.data);
            }
        })
        .catch(() => {
            setLoading(false);
            message.error(__('failed_export'));
        });
    };
    
    const onFieldChanged = (k, v) => {
        setExportReviews({...exportReviews, [k]: v});
    };

    return (
        <>
            <Form 
                form={form} 
                layout="vertical"
                onValuesChange={(changedValues, allValues) => {
                    const key = Object.keys(changedValues)[0];
                    onFieldChanged(key, changedValues[key]);
                }}
            >
                

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item 
                            name="date_range" 
                            label={__('date')}
                        >
                            <DatePicker.RangePicker style={{ width: '100%' }} />
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item 
                            name="products" 
                            label={__('products')}
                        >
                            <AjaxSelect 
                                fetchOptions={productFetchOptions} 
                                mode="multiple" 
                                placeholder={__('choose_products')}
                                style={{ width: '100%' }}
                            />
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item 
                            name="categories" 
                            label={__('categories')}
                        >
                            <AjaxSelect 
                                fetchOptions={categoryFetchOptions} 
                                mode="multiple" 
                                placeholder={__('choose_categories')}
                                style={{ width: '100%' }}
                            />
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item 
                            name="ratings" 
                            label={__('ratings')}
                        >
                            <Select 
                                mode="multiple" 
                                options={[
                                    { value: 1, label: __('one_star') },
                                    { value: 2, label: __('two_stars') },
                                    { value: 3, label: __('three_stars') },
                                    { value: 4, label: __('four_stars') },
                                    { value: 5, label: __('five_stars') }
                                ]}
                                style={{ width: '100%' }}
                            />
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item 
                            name="status" 
                            label={__('status')}
                        >
                            <Select 
                                mode="multiple" 
                                options={[
                                    { value: 'pending', label: __('pending') },
                                    { value: 'approved', label: __('approved') },
                                    { value: 'spam', label: __('spam') },
                                    { value: 'trash', label: __('trash') }
                                ]}
                                style={{ width: '100%' }}
                            />
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item>
                            <Button 
                                type="primary" 
                                onClick={exportNow} 
                                loading={loading}
                            >
                                {__('export')}
                            </Button>
                        </Form.Item>
                    </Col>
                </Row>
            </Form>
        </>
    );
};

export default ExportReviews;