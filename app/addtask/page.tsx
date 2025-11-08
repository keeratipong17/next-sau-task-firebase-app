"use client";
import Image from "next/image";
import task from "./../../assets/images/task.png";
import Link from "next/link";
import { supabase} from "./../../lib/supabaseCilents";
import { useState } from "react";
 
export default function Page() {

  //สร้างตัวแปร State สำหรับเก็บข้อมูลร
  const [title, setTitle] = useState("");
  const [detail, setDetail] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [isCompleted, setIsCompleted] = useState(false);

  const handleSelectImage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  }

  const handleUploadAndSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); // ป้องกันการรีเฟรชหน้า
    // validate input fields
    if (title === "" || detail === "") {
      alert("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }

    let imageUrl = "";

    // Upload รูปไปที่ Supabase Storage
    // validate image file
    if (imageFile) {
        // สร้างชื่อไฟล์ใหม่เพื่อป้องกันชื่อซ้ำ
        const newFileName = `${Date.now()}_${imageFile.name}`;
    

    // บันทึกข้อมูล image_url ลงในตาราง task_tb
    const { data, error } = await supabase.storage
      .from("task_bk") // ชื่อ bucket
      .upload(newFileName, imageFile); // ชื่อไฟล์ และ ไฟล์ที่อัปโหลด

      if (error) {
        alert("เกิดข้อผิดพลาดในการอัปโหลดรูปภาพ กรุณาลองใหม่อีกครั้ง");
        console.error("Error uploading image:", error.message);
        return;
      } else {
        // ถ้าอัปโหลดสำเร็จเอา Image Url มาเพื่อบันทึกในตาราง
      const { data } = supabase.storage
      .from("task_bk") // ชื่อ bucket
      .getPublicUrl(newFileName); // ชื่อไฟล์ที่อัปโหลด
      
      imageUrl = data.publicUrl;

    }
    
  }

    const { data, error } = await supabase
        .from("task_tb") // ชื่อตาราง
        .insert({
          title: title,
          detail: detail,
          image_url: imageUrl,
          is_completed: isCompleted
        });

      // ตรวจสอบ Error ก่อน
      if (error) {
        alert("เกิดข้อผิดพลาดในการบันทึกงานใหม่ กรุณาลองใหม่อีกครั้ง");
        console.error("Error inserting task:", error.message);
        return;
      }

      alert("บันทึกงานใหม่เรียบร้อยแล้ว");

      // redirect to alltask page
      window.location.href = "/alltask";
  }

  return (
    <>
      <div className="flex flex-col items-center pb-10">
        {/* ส่วนบน */}
        <Image className="mt-20" src={task} alt="Task" width={120} />
 
        <h1 className="mt-8 text-2xl font-bold text-blue-700">
          Manage Task App
        </h1>
 
        <h1 className="mt-2 text-lg text-blue-700">บริการจัดการงานที่ทำ</h1>
 
 
        {/* ส่วนเพิ่มงาน */}
        <div className="w-3xl border border-gray-500 p-10 mx-auto rounded-xl mt-5">
          <h1 className="text-xl font-bold text-center">➕ เพิ่มงานใหม่</h1>
 
          <form onSubmit={handleUploadAndSave} className="w-full space-y-4">
            <div>
              <label>ชื่องาน</label>
              <input
                type="text"
                value={title} onChange={(e)=>setTitle(e.target.value)}
                className="w-full border rounded-lg p-2"
                required
              />
            </div>
            <div>
              <label>รายละเอียด</label>
              <textarea
                value={detail} onChange={(e)=>setDetail(e.target.value)}
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
              {/* แสดงตัวอย่างรูปภาพที่เลือก */}
              {imagePreview && (
                <div className="mt-2">
                  <p className="font-medium">ตัวอย่างรูปภาพ:</p>
                  <Image src={imagePreview} alt="Image Preview" width={200} height={200} />
                </div>
              )}
            </div>
            <div>
              <label>สถานะ</label>
              <select
                value={isCompleted ? "1" : "0"}
                onChange={(e) => setIsCompleted(e.target.value === "1")}
                className="w-full border rounded-lg p-2">
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
 
      </div>
    </>
  );
}