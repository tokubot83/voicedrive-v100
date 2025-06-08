// 医療・介護職員プロフィールページコンポーネント
import React, { useState, useEffect } from 'react';
import { MedicalProfile, ProfileFormData } from '../../types/profile';
import EditProfileForm from './EditProfileForm';
import ViewProfileContent from './ViewProfileContent';
import { ExperienceCalculationEngine } from '../../services/ExperienceCalculationEngine';
import { FACILITIES } from '../../data/medical/facilities';
import { DEPARTMENTS } from '../../data/medical/departments';
import { PROFESSIONS } from '../../data/medical/professions';
import { POSITIONS } from '../../data/medical/positions';

interface MedicalProfilePageProps {
  user: MedicalProfile;
  onUpdateProfile: (profile: MedicalProfile) => Promise<void>;
  isEditing?: boolean;
}

const MedicalProfilePage: React.FC<MedicalProfilePageProps> = ({ 
  user, 
  onUpdateProfile,
  isEditing: initialEditing = false 
}) => {
  const [isEditing, setIsEditing] = useState(initialEditing);
  const [profileData, setProfileData] = useState<ProfileFormData>({
    name: user.name || '',
    furigana: user.furigana || '',
    facility: user.facility || '',
    department: user.department || '',
    profession: user.profession || '',
    position: user.position || '',
    hireDate: user.hireDate || '',
    previousExperience: user.previousExperience || 0,
    motto: user.motto || '',
    selfIntroduction: user.selfIntroduction || '',
    hobbies: user.hobbies || [],
    skills: user.skills || [],
    profileImage: user.profileImage,
    coverImage: user.coverImage || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  });

  const handleSaveProfile = async () => {
    // 経験年数・投票重み再計算
    const engine = new ExperienceCalculationEngine();
    const experience = engine.calculateExperience(
      profileData.hireDate, 
      profileData.previousExperience
    );
    
    const votingWeight = engine.calculateVotingWeight(
      profileData.profession,
      profileData.position, 
      experience.totalExperience
    );
    
    const permissionLevel = engine.determinePermissionLevel(
      profileData.position,
      profileData.facility,
      profileData.department
    );

    const approvalAuthority = engine.getApprovalAuthority(profileData.position);
    const profileCompleteRate = engine.calculateProfileCompleteness(profileData);

    const updatedProfile: MedicalProfile = {
      ...user,
      ...profileData,
      experienceYears: experience.currentExperience,
      totalExperience: experience.totalExperience,
      votingWeight,
      permissionLevel,
      approvalAuthority,
      lastProfileUpdate: new Date().toISOString(),
      profileCompleteRate,
      updatedAt: new Date().toISOString()
    };

    await onUpdateProfile(updatedProfile);
    setIsEditing(false);
  };

  const handleImageUpload = (type: 'profile' | 'cover', imageUrl: string) => {
    if (type === 'profile') {
      setProfileData(prev => ({ ...prev, profileImage: imageUrl }));
    } else {
      setProfileData(prev => ({ ...prev, coverImage: imageUrl }));
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* カバー画像セクション */}
      <div className="relative">
        <div 
          className="h-48 w-full rounded-t-lg"
          style={{ 
            background: profileData.coverImage || 
            'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
          }}
        />
        {isEditing && (
          <button 
            className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
            onClick={() => handleImageUpload('cover', 'new-cover-url')}
          >
            📷 カバー画像変更
          </button>
        )}
      </div>

      {/* プロフィール情報セクション */}
      <div className="bg-gray-900 rounded-b-lg p-6">
        <div className="flex justify-between items-start -mt-16 mb-6">
          <div className="flex items-end gap-6">
            {/* プロフィール画像 */}
            <div className="relative">
              <div className="w-32 h-32 bg-black rounded-full flex items-center justify-center text-6xl border-4 border-gray-900">
                {profileData.profileImage ? (
                  <img 
                    src={profileData.profileImage} 
                    alt={profileData.name}
                    className="w-full h-full rounded-full object-cover" 
                  />
                ) : (
                  <div className="text-6xl">👤</div>
                )}
              </div>
              {isEditing && (
                <button 
                  className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors"
                  onClick={() => handleImageUpload('profile', 'new-profile-url')}
                >
                  📷
                </button>
              )}
            </div>
            
            {/* 基本情報 */}
            <div className="pb-4">
              <h1 className="text-2xl font-bold text-white">{profileData.name || '未設定'}</h1>
              <p className="text-gray-400">
                {FACILITIES[profileData.facility]?.name || '施設未設定'} • {DEPARTMENTS[profileData.department]?.name || '部署未設定'}
              </p>
              <p className="text-gray-500 text-sm">
                {PROFESSIONS[profileData.profession]?.name || '職種未設定'} • {POSITIONS[profileData.position]?.name || '役職未設定'}
              </p>
              
              {/* 権限・統計バッジ */}
              <div className="flex gap-2 mt-2">
                <span className="bg-blue-900 text-blue-300 px-2 py-1 rounded-full text-xs">
                  経験 {user.totalExperience || 0}年
                </span>
                <span className="bg-purple-900 text-purple-300 px-2 py-1 rounded-full text-xs">
                  投票重み {user.votingWeight || 1.0}x
                </span>
                <span className="bg-green-900 text-green-300 px-2 py-1 rounded-full text-xs">
                  権限レベル {user.permissionLevel || 1}
                </span>
                {user.profileCompleteRate !== undefined && (
                  <span className="bg-orange-900 text-orange-300 px-2 py-1 rounded-full text-xs">
                    完成度 {user.profileCompleteRate}%
                  </span>
                )}
              </div>
            </div>
          </div>
          
          {/* 編集ボタン */}
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            {isEditing ? 'キャンセル' : '編集'}
          </button>
        </div>

        {isEditing ? (
          <EditProfileForm 
            profileData={profileData}
            setProfileData={setProfileData}
            onSave={handleSaveProfile}
          />
        ) : (
          <ViewProfileContent profileData={user} />
        )}
      </div>
    </div>
  );
};

export default MedicalProfilePage;