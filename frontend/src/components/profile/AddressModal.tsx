import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { FaTimes } from 'react-icons/fa';
import Select from 'react-select';
import { getProvinces, getDistrictsByProvinceCode, getWardsByDistrictCode } from 'sub-vn';
import { addAddressAPI, updateAddressAPI } from '../../services/userService';

// Schema xác thực
const addressSchema = z.object({
    receiverName: z.string().min(1, "Họ tên không được để trống"),
    phone: z.string().regex(/^(03|05|07|08|09)[0-9]{8}$/, "Số điện thoại không hợp lệ"),
    province: z.any().refine(val => val !== null, "Vui lòng chọn Tỉnh/Thành"),
    district: z.any().refine(val => val !== null, "Vui lòng chọn Quận/Huyện"),
    ward: z.any().refine(val => val !== null, "Vui lòng chọn Phường/Xã"),
    detailAddress: z.string().min(5, "Vui lòng nhập địa chỉ cụ thể"),
    isDefault: z.boolean().default(false)
});

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    initialData?: any;
}

const AddressModal = ({ isOpen, onClose, onSuccess, initialData }: Props) => {
    const provinceOptions = getProvinces().map(p => ({ label: p.name, value: p.code }));
    const [districtOptions, setDistrictOptions] = useState<any[]>([]);
    const [wardOptions, setWardOptions] = useState<any[]>([]);

    const { control, handleSubmit, reset, watch, setValue, formState: { isSubmitting, errors } } = useForm({
        resolver: zodResolver(addressSchema),
        defaultValues: {
            receiverName: "",
            phone: "",
            province: null,
            district: null,
            ward: null,
            detailAddress: "",
            isDefault: false
        }
    });

    const selectedProvince = watch("province");
    const selectedDistrict = watch("district");


    useEffect(() => {
        if (isOpen) {
            if (initialData) {

                const p = provinceOptions.find(i => i.label === initialData.province);
                const dList = p ? getDistrictsByProvinceCode(p.value).map(d => ({ label: d.name, value: d.code })) : [];
                const d = dList.find(i => i.label === initialData.district);
                const wList = d ? getWardsByDistrictCode(d.value).map(w => ({ label: w.name, value: w.code })) : [];
                const w = wList.find(i => i.label === initialData.ward);

                reset({
                    ...initialData,
                    province: p || null,
                    district: d || null,
                    ward: w || null
                });
            } else {
                reset({ receiverName: "", phone: "", province: null, district: null, ward: null, detailAddress: "", isDefault: false });
            }
        }
    }, [isOpen, initialData, reset]);

    useEffect(() => {
        if (selectedProvince?.value) {
            const districts = getDistrictsByProvinceCode(selectedProvince.value);
            setDistrictOptions(districts.map(d => ({ label: d.name, value: d.code })));


            if (!initialData || selectedProvince.label !== initialData.province) {
                setValue("district", null);
                setValue("ward", null);
            }
        }
    }, [selectedProvince, setValue, initialData]);

    useEffect(() => {
        if (selectedDistrict?.value) {
            const wards = getWardsByDistrictCode(selectedDistrict.value);
            setWardOptions(wards.map(w => ({ label: w.name, value: w.code })));

            if (!initialData || selectedDistrict.label !== initialData.district) {
                setValue("ward", null);
            }
        }
    }, [selectedDistrict, setValue, initialData]);

    const onSubmit = async (data: any) => {
        const payload = {
            ...data,
            province: data.province.label,
            district: data.district.label,
            ward: data.ward.label
        };

        try {
            if (initialData) await updateAddressAPI(initialData.addressId, payload);
            else await addAddressAPI(payload);
            onSuccess();
            onClose();
        } catch (err) {
            alert("Lỗi khi lưu dữ liệu!");
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in duration-200">
                <div className="flex justify-between items-center p-6 border-b bg-gray-50">
                    <h3 className="font-black uppercase tracking-tighter text-gray-800">
                        {initialData ? 'Chỉnh sửa địa chỉ' : 'Thêm địa chỉ giao hàng mới'}
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-black transition-colors"><FaTimes size={20} /></button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-5" style={{ fontFamily: 'Times New Roman' }}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1">
                            <label className="text-[13px] font-bold text-gray-700">Tên người nhận *</label>
                            <Controller
                                name="receiverName"
                                control={control}
                                render={({ field }) => (
                                    <input {...field} value={field.value || ""} className="w-full border-2 p-3 rounded-xl outline-none focus:border-black transition-all text-[14px]" placeholder="Nhập tên người nhận" />
                                )}
                            />
                            {errors.receiverName && <p className="text-red-600 text-[11px] italic mt-1">{errors.receiverName.message as string}</p>}
                        </div>
                        <div className="space-y-1">
                            <label className="text-[13px] font-bold text-gray-700">Số điện thoại *</label>
                            <Controller
                                name="phone"
                                control={control}
                                render={({ field }) => (
                                    <input {...field} value={field.value || ""} className="w-full border-2 p-3 rounded-xl outline-none focus:border-black transition-all text-[14px]" placeholder="Nhập SĐT" />
                                )}
                            />
                            {errors.phone && <p className="text-red-600 text-[11px] italic mt-1">{errors.phone.message as string}</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-1">
                            <label className="text-[13px] font-bold text-gray-700">Tỉnh/Thành phố *</label>
                            <Controller
                                name="province"
                                control={control}
                                render={({ field }) => (
                                    <Select {...field} options={provinceOptions} placeholder="Chọn..." className="text-[13px]" />
                                )}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[13px] font-bold text-gray-700">Quận/Huyện *</label>
                            <Controller
                                name="district"
                                control={control}
                                render={({ field }) => (
                                    <Select {...field} options={districtOptions} placeholder="Chọn..." isDisabled={!selectedProvince} className="text-[13px]" />
                                )}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[13px] font-bold text-gray-700">Phường/Xã *</label>
                            <Controller
                                name="ward"
                                control={control}
                                render={({ field }) => (
                                    <Select {...field} options={wardOptions} placeholder="Chọn..." isDisabled={!selectedDistrict} className="text-[13px]" />
                                )}
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[13px] font-bold text-gray-700">Địa chỉ cụ thể *</label>
                        <Controller
                            name="detailAddress"
                            control={control}
                            render={({ field }) => (
                                <textarea {...field} value={field.value || ""} rows={2} className="w-full border-2 p-3 rounded-xl outline-none focus:border-black transition-all text-[14px]" placeholder="Số nhà, tên đường..." />
                            )}
                        />
                        {errors.detailAddress && <p className="text-red-600 text-[11px] italic mt-1">{errors.detailAddress.message as string}</p>}
                    </div>

                    <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-xl border-2 border-dashed border-gray-200">
                        <Controller
                            name="isDefault"
                            control={control}
                            render={({ field: { value, onChange } }) => (
                                <input type="checkbox" id="isDef" checked={value} onChange={onChange} className="w-5 h-5 accent-black cursor-pointer" />
                            )}
                        />
                        <label htmlFor="isDef" className="text-[14px] font-bold text-gray-600 cursor-pointer">Đặt làm địa chỉ nhận hàng mặc định</label>
                    </div>

                    <div className="flex justify-end gap-4 pt-4">
                        <button type="button" onClick={onClose} className="px-8 py-3 font-bold text-gray-400 hover:text-black uppercase text-[12px] transition-colors">Hủy</button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-10 py-3 bg-black text-white font-black uppercase text-[12px] hover:bg-red-600 transition-all shadow-xl disabled:bg-gray-400 rounded-lg"
                        >
                            {isSubmitting ? 'Đang lưu...' : 'Xác nhận lưu'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddressModal;