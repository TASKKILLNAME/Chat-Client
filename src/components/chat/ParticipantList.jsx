// src/components/chat/ParticipantList.jsx
import React from 'react';

const ParticipantList = ({ participants }) => (
  <div className="bg-gray-100 p-4">
    <h3 className="text-lg font-semibold mb-2">참가자 목록</h3>
    <div className="flex flex-wrap gap-2">
      {participants.map(participant => (
        <span key={participant._id} className="bg-blue-100 px-2 py-1 rounded">
          {participant.username}
        </span>
      ))}
    </div>
  </div>
);

export default ParticipantList;