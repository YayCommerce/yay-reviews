import React, { useEffect } from 'react';
import { Button, Switch, Input, message, Form, Row, Col } from 'antd';
import ReactQuill from 'react-quill';
import SettingsServices from '../services/SettingServices'
import { __ } from "../utils/Helpers";

import useStore from '../store';

const Review = () => {
    const [form] = Form.useForm();
    const { reviews, setReviews, triggerSaveReviews, setTriggerSaveReviews, setLoadingSaveButton } = useStore((state) => ({
        reviews: state.reviews,
        setReviews: state.setReviews,
        triggerSaveReviews: state.triggerSaveReviews,
        setTriggerSaveReviews: state.setTriggerSaveReviews,
        setLoadingSaveButton: state.setLoadingSaveButton
    }));
    const [loading, setLoading] = React.useState(false);

    useEffect(() => {
        SettingsServices.getSettings((data) => {
            setReviews(data['reviews']);
            form.setFieldsValue(data['reviews']);
        }, () => {
            message.error(__('failed_load_state'))
        })
    }, []);

    // Listen for save trigger from main.jsx
    useEffect(() => {
        if (triggerSaveReviews) {
            form.submit();
        }
    }, [triggerSaveReviews]);

    const saveSettings = (value) => {
        setReviews(value)
        setLoading(true);
        SettingsServices.saveSettings({ reviews: value }, (data) => {
            setLoading(false);
            if (data.success) {
                message.success(__('settings_saved'));
            } else {
                message.error(__('failed_save_settings'));
            }
            setTriggerSaveReviews(false);
            setLoadingSaveButton(false);
        }, () => {
            setLoading(false);
            message.error(__('failed_save_settings'));
            setTriggerSaveReviews(false);
            setLoadingSaveButton(false);
        })
    }

    return (
        <>
            <h1>{__('review')}</h1>
            <Form
                form={form}
                layout="vertical"
                initialValues={reviews}
                onFinish={saveSettings}
            >
                <Row gutter={16}>
                    <Col span={6}>
                        <Form.Item name="anchor_link" label={__('reviews_anchor_link')}>
                            <Input />
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={16}>
                    <Col span={6}>
                        <Form.Item 
                            name="enabled_photos_videos" 
                            label={__('include_photos_videos')} 
                            tooltip={__('tooltip_photos_videos')}
                        >
                            <Switch />
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item 
                            name="upload_required"
                            label={__('upload_required')} 
                            tooltip={__('tooltip_upload_required')}
                        >
                            <Switch />
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={16}>
                    <Col span={6}>
                        <Form.Item name="max_upload_file_size" label={__('max_upload_file_size')} tooltip={__('tooltip_max_file_size')}>
                            <Input type="number" addonAfter={`KB (Max ${yay_reviews_data.upload_max_size} KB)`} min={0} />
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item name="max_upload_file_qty" label={__('max_upload_file_qty')} tooltip={__('tooltip_max_file_qty')}>
                            <Input type="number" addonAfter={`Max ${yay_reviews_data.upload_max_qty}`} min={0} />
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={16}>
                    <Col span={6}>
                        <Form.Item name="enabled_gdpr_checkbox" label={__('enable_gdpr_checkbox')}>
                            <Switch />
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item name="gdpr_message" label={__('gdpr_message')}>
                            <ReactQuill theme="snow" />
                        </Form.Item>
                    </Col>
                </Row>
            </Form>
        </>
    );
}

export default Review;