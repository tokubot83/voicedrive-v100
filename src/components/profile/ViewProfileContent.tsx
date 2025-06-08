// プロフィール表示コンポーネント
import React from 'react';
import { MedicalProfile } from '../../types/profile';
import { FACILITIES } from '../../data/medical/facilities';
import { DEPARTMENTS } from '../../data/medical/departments';
import { PROFESSIONS } from '../../data/medical/professions';
import { POSITIONS } from '../../data/medical/positions';
import { HOBBIES } from '../../data/medical/hobbies';

interface ViewProfileContentProps {
  profileData: MedicalProfile;
}

const ViewProfileContent: React.FC<ViewProfileContentProps> = ({ profileData }) => {
  const facility = FACILITIES[profileData.facility];
  const department = DEPARTMENTS[profileData.department];
  const profession = PROFESSIONS[profileData.profession];
  const position = POSITIONS[profileData.position];

  return (
    <div className="space-y-6">
      {/* モットー */}
      {profileData.motto && (
        <div className="bg-gradient-to-r from-blue-950/30 to-purple-950/30 border border-blue-800/30 rounded-lg p-4">
          <h3 className="text-sm text-blue-300 mb-2">モットー</h3>
          <p className="text-white text-lg italic">"{profileData.motto}"</p>
        </div>
      )}

      {/* 自己紹介 */}
      {profileData.selfIntroduction && (
        <div>
          <h3 className="text-white font-medium mb-2">自己紹介</h3>
          <p className="text-gray-300 leading-relaxed">{profileData.selfIntroduction}</p>
        </div>
      )}

      {/* 職務情報 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="text-white font-medium mb-3">職務情報</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">所属施設</span>
              <span className="text-white">{facility?.name || '未設定'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">所属部署</span>
              <span className="text-white">{department?.name || '未設定'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">職種</span>
              <span className="text-white">{profession?.name || '未設定'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">役職</span>
              <span className="text-white">{position?.name || '未設定'}</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="text-white font-medium mb-3">経験・権限</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">入職日</span>
              <span className="text-white">
                {profileData.hireDate ? new Date(profileData.hireDate).toLocaleDateString('ja-JP') : '未設定'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">当院経験</span>
              <span className="text-white">{profileData.experienceYears || 0}年</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">総経験年数</span>
              <span className="text-white">{profileData.totalExperience || 0}年</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">投票重み</span>
              <span className="text-purple-400 font-medium">{profileData.votingWeight || 1.0}x</span>
            </div>
          </div>
        </div>
      </div>

      {/* 趣味・興味 */}
      {profileData.hobbies && profileData.hobbies.length > 0 && (
        <div>
          <h3 className="text-white font-medium mb-3">趣味・興味のあること</h3>
          <div className="flex flex-wrap gap-2">
            {profileData.hobbies.map(hobbyId => {
              const hobby = HOBBIES.find(h => h.id === hobbyId);
              return hobby ? (
                <span
                  key={hobbyId}
                  className="bg-blue-900/50 text-blue-300 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                >
                  <span>{hobby.icon}</span>
                  <span>{hobby.name}</span>
                </span>
              ) : null;
            })}
          </div>
        </div>
      )}

      {/* スキル・特技 */}
      {profileData.skills && profileData.skills.length > 0 && (
        <div>
          <h3 className="text-white font-medium mb-3">スキル・特技</h3>
          <div className="flex flex-wrap gap-2">
            {profileData.skills.map(skill => (
              <span
                key={skill}
                className="bg-green-900/50 text-green-300 px-3 py-1 rounded-full text-sm"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* プロフィール統計 */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-lg p-4">
        <h3 className="text-white font-medium mb-3">プロフィール統計</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-blue-400">{profileData.totalExperience || 0}年</p>
            <p className="text-gray-400 text-sm">総経験</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-purple-400">{profileData.votingWeight || 1.0}x</p>
            <p className="text-gray-400 text-sm">投票重み</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-green-400">Lv.{profileData.permissionLevel || 1}</p>
            <p className="text-gray-400 text-sm">権限レベル</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-orange-400">{profileData.profileCompleteRate || 0}%</p>
            <p className="text-gray-400 text-sm">完成度</p>
          </div>
        </div>
      </div>

      {/* 最終更新日 */}
      <div className="text-center text-gray-500 text-sm">
        最終更新: {profileData.lastProfileUpdate ? new Date(profileData.lastProfileUpdate).toLocaleDateString('ja-JP') : '未更新'}
      </div>
    </div>
  );
};

export default ViewProfileContent;