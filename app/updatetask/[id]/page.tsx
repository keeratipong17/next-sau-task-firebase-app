"use client";

import Image from "next/image";
import task from "../../../assets/images/task.png";
import Link from "next/link";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useParams } from "next/navigation";

export default function Page() {
  // สร้างตัวแปรเก็บ id ที่ส่งมา
  const id = useParams().id;
  const [title, setTitle] = useState("");
  const [detail, setDetail] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [isCompleted, setCompleted] = useState(false);

  useEffect(() => {
    async function fetchData() {
      const { data, error } = await supabase
        .from("task_tb")
        .select("*")
        .eq("id", id)
        .single();
      if (error) {
        alert("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
        console.log(error.message);
        return;
      }
      // กรณีไม่พบ error  เอาข้อมูลไปกำหนด State
      setTitle(data.title);
      setDetail(data.detail);
      setCompleted(data.is_completed);
      setImagePreview(data.image_url);
    }

    fetchData();
  }, []);

  const handleSelectImage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleUploadAndUpdate = async (
    evnet: React.FormEvent<HTMLFormElement>
  ) => {
    event?.preventDefault();
    // Validate
    if (title.trim() == "" || detail.trim() == "") {
    }

    // ตัวแปร Image_Url
    let imageUrl = "";

    // อัปโหลด
    if (imageFile) {
      // สร้างชื่อไฟล์ใหม่ไม่ให้ซ้ำกัน
      const newFileName = `${Date.now()}_${imageFile.name}`;
      // อัปโหลดไฟล์เก็บใน Supabase Storage
      const { data, error } = await supabase.storage
        .from("task_bk")
        .upload(newFileName, imageFile);
      if (error) {
        alert("เกิดข้อผิดพลาดในการอัปโหลด");
        console.log(error.message);
        return;
      } else {
        // เอา Image Url
        const { data } = await supabase.storage
          .from("task_bk")
          .getPublicUrl(newFileName);

        imageUrl = data.publicUrl;
      }
    }

    // บันทึกแก้ไขงานลง task_tb ใน supabase
    const { data, error } = await supabase
      .from("task_tb")
      .update({
        title: title,
        detail: detail,
        image_url: imageUrl,
        is_completed: isCompleted,
        update_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      alert("เกิดข้อผิดพลาดในการบันทึกแก้ไขข้อมูล กรุณาลองใหม่อีกครั้ง");
      console.log(error.message);
      return;
    }

    alert("บันทึกแก้ไขข้อมูลเรียบร้อยแล้ว");

    window.location.href = "/alltask";
  };

  return (
    <>
      <div className="flex flex-col items-center pb-30">
        {/* ส่วนบน */}
        <Image className="mt-20" src={task} alt="Task" width={120} />

        <h1 className="mt-8 text-2xl font-bold text-blue-700">
          Manage Task App
        </h1>

        <h1 className="mt-2 text-lg text-blue-700">บริการจัดการงานที่ทำ</h1>

        {/* ส่วนเพิ่มงาน */}
        <div className="w-3xl border border-gray-500 p-10 mx-auto rounded-xl mt-5">
          <h1 className="text-xl font-bold text-center">🖊️ แก้ไขงานเก่า</h1>

          <form onSubmit={handleUploadAndUpdate} className="w-full space-y-4">
            <div>
              <label>ชื่องาน</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                type="text"
                className="w-full border rounded-lg p-2"
                required
              />
            </div>
            <div>
              <label>รายละเอียด</label>
              <textarea
                value={detail}
                onChange={(e) => setDetail(e.target.value)}
                className="w-full border rounded-lg p-2"
                rows={5}
                required
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">อัปโหลดรูป</label>
              <input
                id="fileInput"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleSelectImage}
              />
              <label
                htmlFor="fileInput"
                className="inline-block bg-blue-500 text-white px-4 py-2
                         rounded cursor-pointer hover:bg-blue-600"
              >
                เลือกรูป
              </label>
              {/* แสดงรูปที่เลือก */}
              {imagePreview && (
                <Image
                  src={imagePreview}
                  alt="Image Preview"
                  width={150}
                  height={150}
                  className="mt-2"
                />
              )}
            </div>
            <div>
              <label>สถานะ</label>
              <select
                className="w-full border rounded-lg p-2"
                value={isCompleted ? "1" : "0"}
                onChange={(e) => setCompleted(e.target.value === "1")}
              >
                <option value="0">❌ยังไม่เสร็จ</option>
                <option value="1">✅เสร็จแล้ว</option>
              </select>
            </div>

            <div>
              <button
                type="submit"
                className="w-full bg-blue-500 text-white px-4 py-2
                               rounded hover:bg-blue-600"
              >
                บันทึกงานใหม่
              </button>
            </div>
          </form>

          <Link
            href="/alltask"
            className="text-blue-500 w-full text-center mt-5 block hover:text-blue-600"
          >
            กลับไปหน้าแสดงงานทั้งหมด
          </Link>
        </div>

        {/* ส่วน Footer*/}
        
      </div>
    </>
  );
}
