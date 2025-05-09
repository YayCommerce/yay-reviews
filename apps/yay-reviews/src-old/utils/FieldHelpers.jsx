import { Switch, Input, Select, ColorPicker, DatePicker, Collapse } from 'antd';
import { productFetchOptions, categoryFetchOptions, couponFetchOptions } from '../fetchOptions';
import AjaxSelect from '../utils/AjaxSelect';
import CouponCollapse from '../utils/CouponCollapse';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const FieldHelpers = {
    renderFields: (fields, values, on_changed_callback) => {
        return fields.map((f) => {
            return FieldHelpers.renderField(values, f, on_changed_callback, true)
        })
    },
    renderField: (values, field, onFieldChanged, wrap_row = true) => {
        let control = null
        switch (field.type) {
          case 'text':
            control = <Input {...field.more} prefix={ field.prefix } suffix={ field.suffix } addonAfter={ field.addonAfter } addonBefore={ field.addonBefore } type={field.input_type} value={values[field.name]} onChange={(e) => onFieldChanged(field.name, e.target.value)} />
          break;
          case 'date_picker':
            control = <DatePicker value={values[field.name]} onChange={(e) => onFieldChanged(field.name, e)} />
          break;
          case 'date_range':
            const { RangePicker } = DatePicker;
            control = <RangePicker onChange={(date, dateString) => onFieldChanged(field.name, dateString)}  />
          break;
          case 'text_editor':
            control = <ReactQuill theme="snow" value={values[field.name]} onChange={(e) => onFieldChanged(field.name, e)} />
          break;
          case 'color_picker':
            control = <ColorPicker format="hex" value={values[field.name]} onChange={(val) => onFieldChanged(field.name, val?.toHexString())} showText />
          break;
          case 'select':
            //mode: multiple | tags
            control = <Select options={field.options} mode={ field.mode } value={values[field.name]} onChange={(value) => onFieldChanged(field.name, value)} style={{ width: '100%' }} />
          break;
          case 'ajax_select':
            let fetchOptions = null
            if(field.fetchOptions == 'productFetchOptions') {
                fetchOptions = productFetchOptions
            } else if(field.fetchOptions == 'categoryFetchOptions') {
              fetchOptions = categoryFetchOptions
            } else if(field.fetchOptions == 'couponFetchOptions') {
              fetchOptions = couponFetchOptions
            }
            control = <AjaxSelect mode={field.mode} fetchOptions={ fetchOptions } value={values[field.name]} onChange={(value) => onFieldChanged(field.name, value)} placeholder={field.placeholder} />
          break;
          case 'switcher':
            control = <Switch checked={values[field.name]} onChange={(checked) => onFieldChanged(field.name, checked)} />;
          break;
          case 'group_row':
            control = (<div className='display-flex'>
              {
                field.children.map((child) => {
                  return FieldHelpers.renderField(values, child, onFieldChanged, false)
                })
              }
              </div>);
          break;
          case 'group_table':
            control = (
              <table className='form-table'>
                <tbody>
                {
                  field.children.map((child) => {
                    return FieldHelpers.renderField(values, child, onFieldChanged, true)
                  })
                }
                </tbody>
              </table>
            )
          break;
          case 'coupon_collapse':
            control = (
              <CouponCollapse items={values[field.name]} defaultActiveKey={['1']} />
            )
          break;
        }
        return wrap_row ? (
          <tr key={ field.name }>
            <th scope='row'>
              <label>{ field.label }</label>
            </th>
            <td>
              { field.before }
              { control }
              {
                field.desc && (<p className='description'>{ field.desc }</p>)
              }
              {
                field.after && <div style={ {marginTop: "10px"} } dangerouslySetInnerHTML={ {__html: field.after} }></div>
              }
            </td>
          </tr>
        ) : (
          <div key={ field.name }>{control}</div>
        )
    }
}
export default FieldHelpers;