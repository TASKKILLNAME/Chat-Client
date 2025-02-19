// components/chat/InviteModal.jsx
import React, { useState, useEffect } from 'react';
import { chatAPI } from '../../services/api';

const InviteModal = ({ roomId, onClose, onInvite }) => {
 const [users, setUsers] = useState([]);
 const [selectedUsers, setSelectedUsers] = useState([]);
 const [loading, setLoading] = useState(true);

 useEffect(() => {
   const fetchUsers = async () => {
     try {
       const response = await chatAPI.getInvitableUsers(roomId);
       setUsers(response.data);
     } catch (error) {
       console.error('사용자 목록 로드 오류:', error);
     } finally {
       setLoading(false);
     }
   };

   fetchUsers();
 }, [roomId]);

 const handleSubmit = (e) => {
   e.preventDefault();
   onInvite(selectedUsers);
 };

 const handleUserSelect = (userId) => {
   setSelectedUsers(prev => {
     if (prev.includes(userId)) {
       return prev.filter(id => id !== userId);
     }
     return [...prev, userId];
   });
 };

 if (loading) {
   return (
     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
       <div className="bg-white rounded-lg p-6">
         로딩 중...
       </div>
     </div>
   );
 }

 return (
   <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
     <div className="bg-white rounded-lg p-6 w-96">
       <h2 className="text-xl font-bold mb-4">사용자 초대</h2>
       
       <form onSubmit={handleSubmit}>
         <div className="max-h-96 overflow-y-auto mb-4">
           {users.length === 0 ? (
             <p className="text-gray-500 text-center">초대할 수 있는 사용자가 없습니다.</p>
           ) : (
             users.map(user => (
               <div 
                 key={user._id}
                 className="flex items-center p-2 hover:bg-gray-100 cursor-pointer"
                 onClick={() => handleUserSelect(user._id)}
               >
                 <input
                   type="checkbox"
                   checked={selectedUsers.includes(user._id)}
                   onChange={() => {}}
                   className="mr-2"
                 />
                 <span>{user.username}</span>
               </div>
             ))
           )}
         </div>

         <div className="flex justify-end gap-2">
           <button
             type="button"
             onClick={onClose}
             className="px-4 py-2 text-gray-600 hover:text-gray-800"
           >
             취소
           </button>
           <button
             type="submit"
             disabled={selectedUsers.length === 0}
             className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300"
           >
             초대하기
           </button>
         </div>
       </form>
     </div>
   </div>
 );
};

export default InviteModal;