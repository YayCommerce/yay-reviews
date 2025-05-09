import React, { useEffect } from 'react';
import { Button, Form, message, Switch, Input, Row, Col } from 'antd';

import { __ } from "../utils/Helpers";

import SettingsServices from '../services/SettingServices'

import useStore from '../store';
const General = () => {
    const [form] = Form.useForm();
    const { general, setGeneral, triggerSaveGeneral, setTriggerSaveGeneral, setLoadingSaveButton } = useStore((state) => ({
        general: state.general,
        setGeneral: state.setGeneral,
        triggerSaveGeneral: state.triggerSaveGeneral,
        setTriggerSaveGeneral: state.setTriggerSaveGeneral,
        setLoadingSaveButton: state.setLoadingSaveButton
    }));

    useEffect(() => {
        SettingsServices.getSettings((data) => {
            setGeneral(data['general']);
            form.setFieldsValue(data['general']);
        }, () => {
            message.error(__('failed_load_state'));
        })
    }, []);

    // Listen for save trigger from main.jsx
    useEffect(() => {
        if (triggerSaveGeneral) {
            form.submit();
        }
    }, [triggerSaveGeneral]);

    const saveSettings = (value) => {
        setGeneral(value);
        SettingsServices.saveSettings({ general: value }, (data) => {
            if (data.success) {
                message.success(__('settings_saved'));
            } else {
                message.error(__('failed_save_settings'));
            }
            setTriggerSaveGeneral(false);
            setLoadingSaveButton(false);
        }, () => {
            message.error(__('failed_save_settings'));
            setTriggerSaveGeneral(false);
            setLoadingSaveButton(false);
        });
    };

    return (
        <>
            <h1>{ __('general') }</h1>
            <Form
                form={form}
                layout="vertical"
                initialValues={general}
                onFinish={saveSettings}
                >
                <Form.Item layout={'horizontal'} name="enabled" label={__('enable')}>
                    <Switch  />
                </Form.Item>
            </Form>
        </>
    );
}
export default General;