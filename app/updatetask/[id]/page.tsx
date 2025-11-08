"use client";
import Image from "next/image";
import task from "./../../assets/images/task.png";
import Link from "next/link";
import Footer from "@/components/Footer";
import { supabase } from "../../../lib/supabaseCilents";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { firestore } from "@/lib/firebaseConfig";
import { collection, getDoc, updateDoc, doc } from "firebase/firestore";


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
      // ดึงข้อมูลงานจาก Firestore ตาม id ที่ส่งมา

      try {
        const docFetch = await getDoc(
          doc(firestore, "task_cl", id as string)
        );

        setTitle(docFetch.data()?.title || "");
        setDetail(docFetch.data()?.detail || "");
        setImagePreview(docFetch.data()?.image_url || "");
        setCompleted(docFetch.data()?.is_completed || false);
      } catch (error) {
        console.error("Error fetching task:", error);
        alert("เกิดข้อผิดพลาดในการดึงข้อมูลงาน กรุณาลองใหม่อีกครั้ง");
      }
    }

    fetchData(); // อย่าลืมเรียกฟังก์ชัน
  }, [id]);

  const handleSelectImage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleUploadAndUpdate = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault(); // ป้องกันการรีเฟรชหน้า
    // validate input fields
    if (title.trim() === "" || detail.trim() === "") {
      alert("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }

    let imageUrl = imagePreview || "";

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
    // อัพเดทข้อมูลงานใน Firebase

    try {
      await updateDoc(doc(firestore, "task_cl", id as string), {
        title: title,
        detail: detail,
        image_url: imageUrl,
        is_completed: isCompleted,
      });

      alert("แก้ไขงานเรียบร้อยแล้ว");
      window.location.href = "/alltask";
    } 
    catch (error) {
      alert("เกิดข้อผิดพลาดในการแก้ไขงาน กรุณาลองใหม่อีกครั้ง");
      console.error("Error saving new task:", error);
      throw error;
    }
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
