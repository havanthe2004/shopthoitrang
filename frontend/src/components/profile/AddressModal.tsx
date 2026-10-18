import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { X, MapPin, User, Phone, Check, Loader2, Home } from 'lucide-react';
import Select from 'react-select';
import { getProvinces, getDistrictsByProvinceCode, getWardsByDistrictCode } from 'sub-vn';
import { addAddressAPI, updateAddressAPI } from '../../services/userService';
import { toast } from 'react-toastify';

const addressSchema = z.object({
    receiverName: z.string().min(2, "Họ và tên người nhận phải có ít nhất 2 ký tự"),
    phone: z.string().regex(/^(03|05|07|08|09)[0-9]{8}$/, "Số điện thoại không hợp lệ (10 số, bắt đầu bằng 03, 05, 07, 08, 09)"),
    province: z.any().refine(val => val !== null && val !== undefined, "Vui lòng chọn Tỉnh / Thành phố"),
    district: z.any().refine(val => val !== null && val !== undefined, "Vui lòng chọn Quận / Huyện"),
    ward: z.any().refine(val => val !== null && val !== undefined, "Vui lòng chọn Phường / Xã"),
    detailAddress: z.string().min(5, "Vui lòng nhập địa chỉ cụ thể (tối thiểu 5 ký tự)"),
    isDefault: z.boolean().default(false)
});

type AddressFormData = z.infer<typeof addressSchema>;

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    initialData?: any;
}

const customSelectStyles = {
    control: (base: any, state: any) => ({
        ...base,
        borderRadius: '0.75rem',
        borderColor: state.isFocused ? '#171717' : '#E5E7EB',
        boxShadow: state.isFocused ? '0 0 0 3px rgba(23, 23, 23, 0.05)' : 'none',
        padding: '2px 4px',
        fontSize: '13px',
        fontWeight: '500',
        '&:hover': {
            borderColor: '#D1D5DB'
        }
    }),
    option: (base: any, state: any) => ({
        ...base,
        backgroundColor: state.isSelected ? '#171717' : state.isFocused ? '#FEE2E2' : 'white',
        color: state.isSelected ? 'white' : '#1F2937',
        fontSize: '13px',
        fontWeight: '500',
        cursor: 'pointer'
    }),
    menu: (base: any) => ({
        ...base,
        borderRadius: '1rem',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
        overflow: 'hidden',
        zIndex: 9999
    })
};

const AddressModal: React.FC<Props> = ({ isOpen, onClose, onSuccess, initialData }) => {
    const provinceOptions = getProvinces().map((p: any) => ({ label: p.name, value: p.code }));
    const [districtOptions, setDistrictOptions] = useState<any[]>([]);
    const [wardOptions, setWardOptions] = useState<any[]>([]);

    const {
        control,
        handleSubmit,
        reset,
        watch,
        setValue,
        formState: { isSubmitting, errors }
    } = useForm<AddressFormData>({
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
                const p = provinceOptions.find((i: any) => i.label === initialData.province);
                const dList = p ? getDistrictsByProvinceCode(p.value).map((d: any) => ({ label: d.name, value: d.code })) : [];
                const d = dList.find((i: any) => i.label === initialData.district);
                const wList = d ? getWardsByDistrictCode(d.value).map((w: any) => ({ label: w.name, value: w.code })) : [];
                const w = wList.find((i: any) => i.label === initialData.ward);

                reset({
                    receiverName: initialData.receiverName || "",
                    phone: initialData.phone || "",
                    province: p || null,
                    district: d || null,
                    ward: w || null,
                    detailAddress: initialData.detailAddress || "",
                    isDefault: Boolean(initialData.isDefault)
                });
            } else {
                reset({
                    receiverName: "",
                    phone: "",
                    province: null,
                    district: null,
                    ward: null,
                    detailAddress: "",
                    isDefault: false
                });
            }
        }
    }, [isOpen, initialData, reset]);

    useEffect(() => {
        if (selectedProvince?.value) {
            const districts = getDistrictsByProvinceCode(selectedProvince.value);
            setDistrictOptions(districts.map((d: any) => ({ label: d.name, value: d.code })));

            if (!initialData || selectedProvince.label !== initialData.province) {
                setValue("district", null);
                setValue("ward", null);
            }
        } else {
            setDistrictOptions([]);
        }
    }, [selectedProvince, setValue, initialData]);

    useEffect(() => {
        if (selectedDistrict?.value) {
            const wards = getWardsByDistrictCode(selectedDistrict.value);
            setWardOptions(wards.map((w: any) => ({ label: w.name, value: w.code })));

            if (!initialData || selectedDistrict.label !== initialData.district) {
                setValue("ward", null);
            }
        } else {
            setWardOptions([]);
        }
    }, [selectedDistrict, setValue, initialData]);

    const onSubmit = async (data: AddressFormData) => {
        const payload = {
            ...data,
            province: data.province.label,
            district: data.district.label,
            ward: data.ward.label
        };

        try {
            if (initialData) {
                await updateAddressAPI(initialData.addressId, payload);
                toast.success("Cập nhật địa chỉ thành công!");
            } else {
                await addAddressAPI(payload);
                toast.success("Thêm địa chỉ nhận hàng mới thành công!");
            }
            onSuccess();
            onClose();
        } catch (err: any) {
            const msg = err.response?.data?.message || "Lỗi khi lưu thông tin địa chỉ!";
            toast.error(msg);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-neutral-900/60 backdrop-blur-xs transition-opacity animate-in fade-in"
                onClick={onClose}
            />

            {/* Modal Body */}
            <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden z-10 animate-in zoom-in-95 duration-200">
                {/* Modal Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-gray-50/70">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center">
                            <Home className="w-4 h-4" />
                        </div>
                        <h3 className="text-base font-black uppercase tracking-tight text-gray-900">
                            {initialData ? 'Chỉnh sửa địa chỉ nhận hàng' : 'Thêm địa chỉ giao hàng mới'}
                        </h3>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-200/60 transition"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit(onSubmit)} className="p-6 md:p-8 space-y-5">
                    {/* Receiver & Phone */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="flex items-center gap-1.5 text-xs font-bold text-gray-700 uppercase tracking-wider">
                                <User className="w-3.5 h-3.5 text-gray-400" />
                                <span>Họ tên người nhận <span className="text-red-500">*</span></span>
                            </label>
                            <Controller
                                name="receiverName"
                                control={control}
                                render={({ field }) => (
                                    <input
                                        {...field}
                                        value={field.value || ""}
                                        placeholder="Nguyễn Văn A"
                                        className={`w-full py-3 px-3.5 rounded-xl text-sm font-semibold border transition outline-none ${
                                            errors.receiverName
                                                ? 'border-red-500 ring-2 ring-red-100'
                                                : 'border-gray-200 focus:border-neutral-900 focus:ring-4 focus:ring-neutral-900/5'
                                        }`}
                                    />
                                )}
                            />
                            {errors.receiverName && (
                                <p className="text-red-600 text-xs font-medium pl-1">
                                    {errors.receiverName.message}
                                </p>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <label className="flex items-center gap-1.5 text-xs font-bold text-gray-700 uppercase tracking-wider">
                                <Phone className="w-3.5 h-3.5 text-gray-400" />
                                <span>Số điện thoại <span className="text-red-500">*</span></span>
                            </label>
                            <Controller
                                name="phone"
                                control={control}
                                render={({ field }) => (
                                    <input
                                        {...field}
                                        value={field.value || ""}
                                        placeholder="0912345678"
                                        className={`w-full py-3 px-3.5 rounded-xl text-sm font-semibold border transition outline-none ${
                                            errors.phone
                                                ? 'border-red-500 ring-2 ring-red-100'
                                                : 'border-gray-200 focus:border-neutral-900 focus:ring-4 focus:ring-neutral-900/5'
                                        }`}
                                    />
                                )}
                            />
                            {errors.phone && (
                                <p className="text-red-600 text-xs font-medium pl-1">
                                    {errors.phone.message}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* 3 Selects: Tỉnh, Huyện, Xã */}
                    <div className="space-y-3">
                        <label className="flex items-center gap-1.5 text-xs font-bold text-gray-700 uppercase tracking-wider">
                            <MapPin className="w-3.5 h-3.5 text-red-600" />
                            <span>Khu vực giao hàng <span className="text-red-500">*</span></span>
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div className="space-y-1">
                                <span className="text-[11px] font-semibold text-gray-400">Tỉnh / Thành phố</span>
                                <Controller
                                    name="province"
                                    control={control}
                                    render={({ field }) => (
                                        <Select
                                            {...field}
                                            options={provinceOptions}
                                            placeholder="Chọn Tỉnh/Thành..."
                                            styles={customSelectStyles}
                                            noOptionsMessage={() => "Không tìm thấy"}
                                        />
                                    )}
                                />
                                {errors.province && (
                                    <p className="text-red-600 text-[11px] font-medium">{errors.province.message as string}</p>
                                )}
                            </div>

                            <div className="space-y-1">
                                <span className="text-[11px] font-semibold text-gray-400">Quận / Huyện</span>
                                <Controller
                                    name="district"
                                    control={control}
                                    render={({ field }) => (
                                        <Select
                                            {...field}
                                            options={districtOptions}
                                            placeholder="Chọn Quận/Huyện..."
                                            isDisabled={!selectedProvince}
                                            styles={customSelectStyles}
                                            noOptionsMessage={() => "Không tìm thấy"}
                                        />
                                    )}
                                />
                                {errors.district && (
                                    <p className="text-red-600 text-[11px] font-medium">{errors.district.message as string}</p>
                                )}
                            </div>

                            <div className="space-y-1">
                                <span className="text-[11px] font-semibold text-gray-400">Phường / Xã</span>
                                <Controller
                                    name="ward"
                                    control={control}
                                    render={({ field }) => (
                                        <Select
                                            {...field}
                                            options={wardOptions}
                                            placeholder="Chọn Phường/Xã..."
                                            isDisabled={!selectedDistrict}
                                            styles={customSelectStyles}
                                            noOptionsMessage={() => "Không tìm thấy"}
                                        />
                                    )}
                                />
                                {errors.ward && (
                                    <p className="text-red-600 text-[11px] font-medium">{errors.ward.message as string}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Detail Address */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                            Địa chỉ cụ thể <span className="text-red-500">*</span>
                        </label>
                        <Controller
                            name="detailAddress"
                            control={control}
                            render={({ field }) => (
                                <textarea
                                    {...field}
                                    value={field.value || ""}
                                    rows={2}
                                    placeholder="Số nhà, tên ngõ, tên đường, tòa nhà..."
                                    className={`w-full py-2.5 px-3.5 rounded-xl text-sm font-semibold border transition outline-none resize-none ${
                                        errors.detailAddress
                                            ? 'border-red-500 ring-2 ring-red-100'
                                            : 'border-gray-200 focus:border-neutral-900 focus:ring-4 focus:ring-neutral-900/5'
                                    }`}
                                />
                            )}
                        />
                        {errors.detailAddress && (
                            <p className="text-red-600 text-xs font-medium pl-1">
                                {errors.detailAddress.message}
                            </p>
                        )}
                    </div>

                    {/* Default Checkbox */}
                    <div className="flex items-center gap-3 p-3.5 bg-gray-50 rounded-xl border border-gray-200/80 cursor-pointer">
                        <Controller
                            name="isDefault"
                            control={control}
                            render={({ field: { value, onChange } }) => (
                                <input
                                    type="checkbox"
                                    id="isDefaultAddr"
                                    checked={Boolean(value)}
                                    onChange={(e) => onChange(e.target.checked)}
                                    className="w-4 h-4 rounded text-red-600 accent-neutral-900 focus:ring-0 cursor-pointer"
                                />
                            )}
                        />
                        <label htmlFor="isDefaultAddr" className="text-xs font-bold text-gray-700 cursor-pointer select-none">
                            Đặt làm địa chỉ nhận hàng mặc định
                        </label>
                    </div>

                    {/* Actions */}
                    <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-bold text-xs uppercase tracking-wider hover:bg-gray-100 transition"
                        >
                            Hủy bỏ
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-neutral-900 text-white font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-red-600 transition-all shadow-md active:scale-95 disabled:bg-gray-400"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>Đang lưu...</span>
                                </>
                            ) : (
                                <>
                                    <Check className="w-4 h-4" />
                                    <span>{initialData ? 'Cập nhật địa chỉ' : 'Lưu địa chỉ'}</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddressModal;