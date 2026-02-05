import { DatePicker, InputNumber, Button, Upload, Select, Modal, Input, Radio } from 'antd/lib';
import { useEffect, useState, useCallback } from 'react';
import dayjs from 'dayjs';
import axios from 'axios';
import { baseUrl } from '~/lib/functional';
import { useNavigate } from 'react-router-dom';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "~/components/ui/form"
import { IoArrowBackSharp } from "react-icons/io5";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCloudUploadAlt } from '@fortawesome/free-solid-svg-icons';
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { ToastContainer, toast } from 'react-toastify';
import { useDropzone } from 'react-dropzone'
import { QrReader } from "react-qr-reader";
import QrScanner from 'qr-scanner';
import { regex } from '../../lib/functional';

const { TextArea } = Input

const formSchema = z.object({
    fullName: z.string().min(2, {
        message: "tên tối thiểu phải có 2 ký tự",
    }),
    gender: z.enum(['0', '1']),
    commune: z.string(),
    district: z.string(),
    province: z.string(),
    phone: z.string(),
    detail: z.string(),
    birthday: z.any(),
    email: z.string({ required_error: 'email là bắt buộc' }).email({ message: 'phải là định dạng email' }),

})
const token = 'a98f6e38-f90a-11ee-8529-6a2e06bbae55'
export default function Add() {

    const navigate = useNavigate();
    const [pending, setPending] = useState(false);
    const [addProvince, setAddProvince] = useState();
    const [addDistrict, setAddDistrict] = useState();
    const [addWard, setAddWard] = useState();

    const [listProvince, setListProvince] = useState([]);
    const [listDistricts, setListDistricts] = useState([]);
    const [listWards, setListWards] = useState([]);

    const [imageLink, setImageLink] = useState();
    const [imageUploading, setImageUploading] = useState(false);
    const [gender, setGender] = useState(false);

    const [originalThumbnail, setOriginalThumbnail] = useState(null);


    useEffect(() => {
        axios.get(`https://online-gateway.ghn.vn/shiip/public-api/master-data/province`, {
            headers: {
                token: token
            }
        }).then(res => {
            setListProvince(res.data.data);
        })
    }, [])

    useEffect(() => {
        if (addProvince) {
            axios.get(`https://online-gateway.ghn.vn/shiip/public-api/master-data/district?province_id=${addProvince.ProvinceID}`, {
                headers: {
                    token: token
                }
            }).then(res => {
                let listFilteredDistrict = res.data.data.filter(dis => dis.DistrictID != 3451);
                setListDistricts(listFilteredDistrict);
                // Removed auto-select default district to avoid overwriting QR scan result
            })
        }
    }, [addProvince])

    useEffect(() => {
        if (addDistrict) {
            axios.get(`https://online-gateway.ghn.vn/shiip/public-api/master-data/ward?district_id=${addDistrict.DistrictID}`, {
                headers: {
                    token: token
                }
            }).then(res => {
                setListWards(res.data.data);
                // Removed auto-select default ward
            })
        }
    }, [addDistrict])

    const form = useForm(
        {
            resolver: zodResolver(formSchema),
            defaultValues: {
                fullName: "",
                gender: "0",
                detail: "",
                phone: "",
                birthday: dayjs(new Date()),
                email: "",
            },
            mode: 'all'
        }
    )

    const onThumbnailDrop = useCallback((acceptedFiles) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            const image = new Image();
            image.src = event.target.result;
            image.onload = () => {
                if (!imageUploading) {
                    const formData = new FormData();
                    formData.append("file", acceptedFiles[0]);
                    formData.append("cloud_name", "db9i1b2yf");
                    formData.append("upload_preset", "product");
                    setImageUploading(true);
                    axios.post(`https://api.cloudinary.com/v1_1/db9i1b2yf/image/upload`, formData).then(res => {
                        setImageLink(res.data.url);
                        toast.success('Ảnh đã tải lên');
                    }).catch(err => {
                        console.log(err)
                    });
                    setImageUploading(false);
                    setOriginalThumbnail({
                        file: acceptedFiles[0],
                        width: image.width,
                        height: image.height,
                    });
                }
            };
        };
        reader.readAsDataURL(acceptedFiles[0]);
    }, []);

    const {
        getRootProps: getThumbnailRootProps,
        getInputProps: getThumbnailInputProps,
        isDragActive: isThumbnailDragActive,
    } = useDropzone({
        onDrop: onThumbnailDrop,
        accept: {
            "image/*": [],
        },
        maxFiles: 1,
        multiple: false,
    });

    const handleSubmitForm = (values) => {
        if (!addProvince) {
            toast.error('chưa chọn Tỉnh/thành phố')
        } else if (!addDistrict) {
            toast.error('chưa chọn Quận/huyện')
        } else if (!addWard) {
            toast.error('chưa chọn Xã/phường')
        } else if (values.fullName.trim().length == 0) {
            toast.error('chưa điền tên')
        } else if (!regex.test(values.phone)) {
            toast.error('sai định dạng số điện thoại')
        } else {
            if (!pending) {
                if (originalThumbnail) {
                    setPending(true);
                    const body = {
                        birthday: values.birthday ? new Date(dayjs(values.birthday).toDate()).toISOString() : null,
                        commune: addWard,
                        detail: values.detail,
                        district: addDistrict.DistrictName,
                        province: addProvince.ProvinceName,
                        email: values.email,
                        status: 0,
                        fullName: values.fullName,
                        gender: gender,
                        phone: values.phone,
                        imageUrl: imageLink
                    }

                    axios.post(`${baseUrl}/user`, body).then(() => {
                        toast.success("Thêm mới thành công");
                        setPending(false);
                        form.reset();
                        setOriginalThumbnail(null);
                        setTimeout(() => {
                            navigate('/user/staff')
                        }, 2000)
                    }).catch(err => {
                        setPending(false);
                        toast.error(err.response.data.message)
                    })
                } else {
                    const body = {
                        birthday: values.birthday ? new Date(dayjs(values.birthday).add(7, 'hour').toDate()).toISOString() : null,
                        commune: addWard,
                        detail: values.detail,
                        district: addDistrict.DistrictName,
                        province: addProvince.ProvinceName,
                        email: values.email,
                        status: 0,
                        fullName: values.fullName,
                        gender: gender,
                        phone: values.phone,
                    }
                    setPending(true);
                    axios.post(`${baseUrl}/user`, body).then(() => {
                        toast.success("Thêm mới thành công")
                        form.reset();
                        setPending(false);
                        setAddDistrict(null);
                        setAddWard(null);
                        setOriginalThumbnail(null);
                        setTimeout(() => {
                            navigate('/user/staff')
                        }, 2000)
                    }).catch(err => {
                        setPending(false);
                        toast.error(err.response.data.message)
                    })
                }
            }
        }
    }

    const [webScan, setWebScan] = useState();


    const camError = (error) => {
        if (error) {
            console.info(error);
        }
    };

    const handleImageScan = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        try {
            const result = await QrScanner.scanImage(file);
            console.log("Image Scan Result:", result);
            ScanResult({ text: result });
        } catch (error) {
            console.error(error);
            toast.error("Không tìm thấy mã QR trong ảnh! Hãy thử ảnh rõ nét hơn.");
        }
    };

    function cleanName(str) {
        if (!str) return "";
        return str.toLowerCase()
            .replace(/^tỉnh\s+|^thành phố\s+|^tp\.\s+|^tp\s+/, "")
            .replace(/^huyện\s+|^quận\s+|^thị xã\s+|^thành phố\s+|^tp\.\s+|^tp\s+/, "")
            .replace(/^xã\s+|^phường\s+|^thị trấn\s+/, "")
            .trim();
    }

    function ScanResult(result) {
        if (result && result.text) {
            const resultText = result.text;
            const parts = resultText.split('|');

            if (parts.length >= 6) {
                setWebScan(result);

                const name = parts[2];
                const birthdayStr = parts[3];
                const genderStr = parts[4];
                const addressFull = parts[5];

                const birthday = dayjs(birthdayStr, 'DDMMYYYY');
                const gender = genderStr === "Nam" ? "0" : "1";

                form.setValue("birthday", birthday);
                form.setValue("fullName", name);
                form.setValue("gender", gender);

                // Address Async Logic
                const addressParts = addressFull.split(',').map(s => s.trim());
                if (addressParts.length >= 3) {
                    const provinceNameRaw = addressParts[addressParts.length - 1];
                    const districtNameRaw = addressParts[addressParts.length - 2];
                    const communeNameRaw = addressParts[addressParts.length - 3];
                    const detailAddr = addressParts.slice(0, addressParts.length - 3).join(', ');

                    form.setValue("detail", detailAddr);

                    const provinceNameClean = cleanName(provinceNameRaw);
                    const districtNameClean = cleanName(districtNameRaw);
                    const communeNameClean = cleanName(communeNameRaw);

                    // 1. Find Province
                    if (listProvince && listProvince.length > 0) {
                        // Priority 1: Exact match after clean
                        let foundProvince = listProvince.find(p => {
                            const pName = cleanName(p.ProvinceName);
                            // Check for special cases like "Thừa Thiên Huế" vs "Thừa Thiên - Huế"
                            return pName === provinceNameClean ||
                                pName.replace(/-/g, " ") === provinceNameClean.replace(/-/g, " ");
                        });

                        // Priority 2: Contains
                        if (!foundProvince) {
                            foundProvince = listProvince.find(p => {
                                const pName = cleanName(p.ProvinceName);
                                return pName.includes(provinceNameClean) || provinceNameClean.includes(pName);
                            });
                        }

                        if (foundProvince) {
                            setAddProvince(foundProvince);

                            // 2. Fetch Districts
                            axios.get(`https://online-gateway.ghn.vn/shiip/public-api/master-data/district?province_id=${foundProvince.ProvinceID}`, {
                                headers: { token: token }
                            }).then(res => {
                                const districts = res.data.data;
                                setListDistricts(districts);

                                let foundDistrict = districts.find(d => cleanName(d.DistrictName) === districtNameClean);

                                if (!foundDistrict) {
                                    foundDistrict = districts.find(d => {
                                        const dName = cleanName(d.DistrictName);
                                        return dName.includes(districtNameClean) || districtNameClean.includes(dName);
                                    });
                                }

                                if (foundDistrict) {
                                    setAddDistrict(foundDistrict);

                                    // 3. Fetch Wards
                                    axios.get(`https://online-gateway.ghn.vn/shiip/public-api/master-data/ward?district_id=${foundDistrict.DistrictID}`, {
                                        headers: { token: token }
                                    }).then(res => {
                                        const wards = res.data.data;
                                        setListWards(wards);

                                        let foundWard = wards.find(w => cleanName(w.WardName) === communeNameClean);

                                        if (!foundWard) {
                                            foundWard = wards.find(w => {
                                                const wName = cleanName(w.WardName);
                                                return wName.includes(communeNameClean) || communeNameClean.includes(wName);
                                            });
                                        }

                                        if (foundWard) {
                                            setAddWard(foundWard.WardName);
                                        }
                                    }).catch(console.error);
                                }
                            }).catch(console.error);
                        }
                    }
                } else {
                    form.setValue("detail", addressFull);
                }

                toast.success("Đã quét thông tin CCCD!");
                setIsModalOpen(false);
            }
        }
    }

    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <div className="mb-9">
            <ToastContainer />
            <div className="">
                <Form {...form}>
                    <form onSubmit={e => { e.preventDefault() }} className="w-full flex gap-5 max-lg:flex-col">
                        <div className="w-1/3 max-lg:w-full flex flex-col gap-6 bg-white shadow-lg rounded-md p-5">
                            <div className='flex gap-2 items-center'>
                                <div className='text-2xl cursor-pointer flex items-center' onClick={() => { navigate('/user/staff') }}><IoArrowBackSharp /></div>
                                <p className='text-2xl font-bold'>Thông tin nhân viên</p>
                                <Button type="primary" onClick={() => setIsModalOpen(true)} className='ml-auto'>
                                    Quét CCCD
                                </Button>
                                <Modal title="Quét mã QR CCCD" open={isModalOpen} onOk={() => { setIsModalOpen(false) }} onCancel={() => { setIsModalOpen(false) }}>
                                    <QrReader
                                        delay={600}
                                        onError={camError}
                                        onResult={ScanResult}
                                        style={{ width: "100%" }}
                                        facingMode="user"
                                        legacyMode={false}
                                    />
                                    <div className="mt-4 flex flex-col items-center border-t pt-4">
                                        <p className="mb-2 font-semibold text-gray-700">Hoặc tải ảnh lên từ thiết bị:</p>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageScan}
                                            className="block w-full text-sm text-slate-500
                                               file:mr-4 file:py-2 file:px-4
                                               file:rounded-full file:border-0
                                               file:text-sm file:font-semibold
                                               file:bg-blue-50 file:text-blue-700
                                               hover:file:bg-blue-100
                                               cursor-pointer"
                                        />
                                    </div>
                                </Modal>
                            </div>
                            <div className='bg-slate-700 h-[2px] mt-1'></div>
                            <div className='w-full flex flex-col gap-5'>
                                <div
                                    {...getThumbnailRootProps()}
                                    className="w-1/2 aspect-square self-center rounded-full border border-dashed border-slate-600 mx-5 flex items-center text-center justify-center"
                                >
                                    <input
                                        {...getThumbnailInputProps()}
                                        disabled={imageUploading}
                                        className="w-full h-full"
                                    />
                                    {isThumbnailDragActive ? (
                                        <p className="text-red-500">Thả ảnh tại đây.</p>
                                    ) : (
                                        <div className="flex gap-1 justify-center items-center w-full h-full">
                                            {originalThumbnail ? (
                                                <img src={URL.createObjectURL(originalThumbnail.file)} alt='' className='w-full h-full aspect-square rounded-full object-cover shadow-sm'></img>
                                            ) : (
                                                <div className='flex flex-col items-center justify-center text-gray-500 hover:text-blue-500 transition-colors gap-2'>
                                                    <FontAwesomeIcon icon={faCloudUploadAlt} className='text-3xl mb-1' />
                                                    <p className='font-semibold text-sm'>Chọn ảnh</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <FormField
                                    control={form.control}
                                    name="fullName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Họ và tên</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Họ và tên" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>
                        <div className="flex-grow flex flex-col gap-2 bg-white shadow-lg rounded-md p-5">
                            {/* <div className='flex justify-between items-center'>
                                <p className='text-2xl font-bold'>Thông tin chi tiết</p>
                                <Button type="primary" onClick={() => setIsModalOpen(true)}>
                                    Quét mã QR
                                </Button>
                                <Modal title="Quét mã QR" open={isModalOpen} onOk={() => { setIsModalOpen(false) }} onCancel={() => { }}>
                                    <QrReader
                                        delay={600}
                                        onError={camError}
                                        chooseDeviceId={"2"}
                                        onResult={ScanResult}
                                        style={{ width: "100%" }}
                                        facingMode="user"
                                        legacyMode={false}
                                    />
                                    <div className="mt-4 flex flex-col items-center border-t pt-4">
                                         <p className="mb-2 font-semibold text-gray-700">Hoặc tải ảnh lên từ thiết bị:</p>
                                         <input 
                                             type="file" 
                                             accept="image/*" 
                                             onChange={handleImageScan} 
                                             className="block w-full text-sm text-slate-500
                                               file:mr-4 file:py-2 file:px-4
                                               file:rounded-full file:border-0
                                               file:text-sm file:font-semibold
                                               file:bg-blue-50 file:text-blue-700
                                               hover:file:bg-blue-100
                                               cursor-pointer"
                                         />
                                     </div>
                                    <p>{webScan && webScan.text}</p>
                                </Modal>
                            </div> */}
                            <div className='bg-slate-600 h-[2px]'></div>
                            <div className='flex flex-col gap-3'>
                                <div className='grid grid-cols-2 gap-3 items-center'>
                                    <FormField
                                        control={form.control}
                                        name="phone"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Số điện thoại</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="số điện thoại" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="gender"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Giới tính</FormLabel>
                                                <FormControl>
                                                    <div>
                                                        <Radio.Group name="radiogroup" value={gender} onChange={(e) => { setGender(e.target.value) }}>
                                                            <Radio value={false}>Nam</Radio>
                                                            <Radio value={true}>Nữ</Radio>
                                                        </Radio.Group>
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <div className='grid grid-cols-2 gap-3 items-center'>
                                    <FormField
                                        control={form.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Email</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="email" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="birthday"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="">Ngày sinh</FormLabel>
                                                <FormControl>
                                                    <div className='mt-2'>
                                                        <DatePicker {...field} className='' placeholder='ngày sinh' needConfirm format="DD/MM/YYYY" />
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                </div>
                                <div className='grid grid-cols-3'>
                                    <FormField
                                        control={form.control}
                                        name="province"
                                        render={({ field }) =>
                                        (
                                            <FormItem>
                                                <FormLabel>Tỉnh/thành phố</FormLabel>
                                                <FormControl>
                                                    <div>
                                                        <Select className='min-w-[180px] w-full' placeholder='Tỉnh/Thành phố' value={addProvince?.ProvinceID} onChange={value => { setAddProvince(listProvince.find(target => target.ProvinceID == value)) }}>
                                                            {
                                                                listProvince.map((province, key) => {
                                                                    return <option key={key} value={province.ProvinceID}>
                                                                        {province.ProvinceName}
                                                                    </option>
                                                                })
                                                            }
                                                        </Select>
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="district"
                                        render={({ field }) =>
                                        (
                                            <FormItem>
                                                <FormLabel className="pl-4">Quận/huyện</FormLabel>
                                                <FormControl>
                                                    <div className='w-full'>
                                                        <Select className='min-w-[180px] w-full pl-4' placeholder='Quận/huyện' value={addDistrict?.DistrictID} onChange={value => { setAddDistrict(listDistricts.find(target => target.DistrictID == value)) }}>
                                                            {
                                                                listDistricts.map((district, key) => {
                                                                    return <option key={key} value={district.DistrictID}>{district.DistrictName}</option>
                                                                })
                                                            }
                                                        </Select>
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="commune"
                                        render={({ field }) =>
                                        (
                                            <FormItem>
                                                <FormLabel className="pl-4">Xã/thị trấn</FormLabel>
                                                <FormControl>
                                                    <div>
                                                        <Select className='min-w-[180px] w-full pl-4' placeholder='Xã/thị trấn' value={addWard} onChange={value => { setAddWard(value) }}>
                                                            {
                                                                listWards.map((ward, key) => {
                                                                    return <option key={key} value={ward.WardName}>{ward.WardName}</option>
                                                                })
                                                            }
                                                        </Select>
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <FormField
                                    control={form.control}
                                    name="detail"
                                    render={({ field }) =>
                                    (
                                        <FormItem>
                                            <FormLabel>Địa chỉ chi tiết</FormLabel>
                                            <FormControl>
                                                <TextArea placeholder="địa chỉ chi tiết" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <div className='flex gap-4'>
                                    <Button type="primary" onClick={() => { handleSubmitForm(form.getValues()) }}>Tạo nhân viên</Button>
                                </div>
                            </div>
                        </div>
                    </form>
                </Form>
            </div>
        </div >
    )
}