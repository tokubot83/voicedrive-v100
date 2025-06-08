// プロフィール編集フォームコンポーネント
import React, { useState, useEffect } from 'react';
import { ProfileFormData } from '../../types/profile';
import { FACILITIES } from '../../data/medical/facilities';
import { DEPARTMENTS } from '../../data/medical/departments';
import { PROFESSIONS } from '../../data/medical/professions';
import { POSITIONS } from '../../data/medical/positions';
import { HOBBIES } from '../../data/medical/hobbies';

interface EditProfileFormProps {
  profileData: ProfileFormData;
  setProfileData: React.Dispatch<React.SetStateAction<ProfileFormData>>;
  onSave: () => void;
}

const EditProfileForm: React.FC<EditProfileFormProps> = ({ 
  profileData, 
  setProfileData, 
  onSave 
}) => {
  const [availableDepartments, setAvailableDepartments] = useState<any[]>([]);
  const [showHobbySelector, setShowHobbySelector] = useState(false);
  const [newSkill, setNewSkill] = useState('');

  // 施設変更時に部署選択肢を更新
  useEffect(() => {
    if (profileData.facility) {
      const facilityData = FACILITIES[profileData.facility];
      const depts = facilityData.departments.map(deptId => ({
        id: deptId,
        ...DEPARTMENTS[deptId]
      }));
      setAvailableDepartments(depts);
    }
  }, [profileData.facility]);

  const handleHobbyToggle = (hobbyId: string) => {
    setProfileData(prev => ({
      ...prev,
      hobbies: prev.hobbies.includes(hobbyId) 
        ? prev.hobbies.filter(id => id !== hobbyId)
        : [...prev.hobbies, hobbyId]
    }));
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !profileData.skills.includes(newSkill.trim())) {
      setProfileData(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }));
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setProfileData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill)
    }));
  };

  return (
    <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); onSave(); }}>
      {/* 基本情報 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-white text-sm mb-2">氏名 *</label>
          <input
            type="text"
            value={profileData.name}
            onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
            className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
            required
          />
        </div>
        
        <div>
          <label className="block text-white text-sm mb-2">ふりがな</label>
          <input
            type="text"
            value={profileData.furigana || ''}
            onChange={(e) => setProfileData(prev => ({ ...prev, furigana: e.target.value }))}
            className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
            placeholder="やまだ たろう"
          />
        </div>
      </div>

      {/* 組織情報 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-white text-sm mb-2">所属施設 *</label>
          <select
            value={profileData.facility}
            onChange={(e) => setProfileData(prev => ({ ...prev, facility: e.target.value, department: '' }))}
            className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
            required
          >
            <option value="">施設を選択</option>
            {Object.values(FACILITIES).map(facility => (
              <option key={facility.id} value={facility.id}>{facility.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-white text-sm mb-2">所属部署 *</label>
          <select
            value={profileData.department}
            onChange={(e) => setProfileData(prev => ({ ...prev, department: e.target.value }))}
            className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
            required
            disabled={!profileData.facility}
          >
            <option value="">部署を選択</option>
            {availableDepartments.map(dept => (
              <option key={dept.id} value={dept.id}>{dept.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-white text-sm mb-2">職種 *</label>
          <select
            value={profileData.profession}
            onChange={(e) => setProfileData(prev => ({ ...prev, profession: e.target.value }))}
            className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
            required
          >
            <option value="">職種を選択</option>
            {Object.values(PROFESSIONS).map(profession => (
              <option key={profession.id} value={profession.id}>{profession.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-white text-sm mb-2">役職 *</label>
          <select
            value={profileData.position}
            onChange={(e) => setProfileData(prev => ({ ...prev, position: e.target.value }))}
            className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
            required
          >
            <option value="">役職を選択</option>
            {Object.values(POSITIONS).map(position => (
              <option key={position.id} value={position.id}>{position.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* 入職情報 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-white text-sm mb-2">入職日 *</label>
          <input
            type="date"
            value={profileData.hireDate}
            onChange={(e) => setProfileData(prev => ({ ...prev, hireDate: e.target.value }))}
            className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
            required
          />
        </div>

        <div>
          <label className="block text-white text-sm mb-2">前職経験年数</label>
          <input
            type="number"
            min="0"
            max="50"
            value={profileData.previousExperience || 0}
            onChange={(e) => setProfileData(prev => ({ ...prev, previousExperience: parseInt(e.target.value) || 0 }))}
            className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
          />
        </div>
      </div>

      {/* プロフィール情報 */}
      <div>
        <label className="block text-white text-sm mb-2">モットー</label>
        <input
          type="text"
          value={profileData.motto || ''}
          onChange={(e) => setProfileData(prev => ({ ...prev, motto: e.target.value }))}
          placeholder="例：患者さまファーストで、笑顔を大切に"
          className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-white text-sm mb-2">自己紹介</label>
        <textarea
          value={profileData.selfIntroduction || ''}
          onChange={(e) => setProfileData(prev => ({ ...prev, selfIntroduction: e.target.value }))}
          placeholder="あなたの経歴、専門分野、仕事への想いなどを自由に書いてください..."
          className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white resize-none focus:border-blue-500 focus:outline-none"
          rows={4}
        />
      </div>

      {/* 趣味選択 */}
      <div>
        <label className="block text-white text-sm mb-2">趣味・興味のあること</label>
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex flex-wrap gap-2 mb-3">
            {profileData.hobbies.map(hobbyId => {
              const hobby = HOBBIES.find(h => h.id === hobbyId);
              return hobby ? (
                <span
                  key={hobbyId}
                  className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm flex items-center gap-1"
                >
                  <span>{hobby.icon}</span>
                  <span>{hobby.name}</span>
                </span>
              ) : null;
            })}
            <button
              type="button"
              onClick={() => setShowHobbySelector(!showHobbySelector)}
              className="bg-gray-700 text-gray-300 px-3 py-1 rounded-full text-sm hover:bg-gray-600 transition-colors"
            >
              {showHobbySelector ? '閉じる' : '+ 追加'}
            </button>
          </div>
          
          {showHobbySelector && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-60 overflow-y-auto">
              {HOBBIES.map(hobby => (
                <label
                  key={hobby.id}
                  className={`flex items-center gap-2 p-2 rounded cursor-pointer transition-colors text-sm ${
                    profileData.hobbies.includes(hobby.id) 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={profileData.hobbies.includes(hobby.id)}
                    onChange={() => handleHobbyToggle(hobby.id)}
                    className="hidden"
                  />
                  <span className="text-lg">{hobby.icon}</span>
                  <span>{hobby.name}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* スキル・特技 */}
      <div>
        <label className="block text-white text-sm mb-2">スキル・特技</label>
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
              placeholder="例：BLS、感染管理、患者対応"
              className="flex-1 p-2 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:border-blue-500 focus:outline-none"
            />
            <button
              type="button"
              onClick={handleAddSkill}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors text-sm"
            >
              追加
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {profileData.skills.map(skill => (
              <span
                key={skill}
                className="bg-green-600 text-white px-3 py-1 rounded-full text-sm flex items-center gap-2 cursor-pointer hover:bg-green-700"
                onClick={() => handleRemoveSkill(skill)}
              >
                {skill} ×
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* 保存ボタン */}
      <div className="flex gap-3">
        <button
          type="submit"
          className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
        >
          プロフィールを保存
        </button>
      </div>
    </form>
  );
};

export default EditProfileForm;