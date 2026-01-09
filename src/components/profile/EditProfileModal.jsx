import React, { useState, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Loader2, X, User as UserIcon, Upload } from 'lucide-react';
import { User } from '@/entities/User';
import { UploadFile } from '@/integrations/Core';
import AuthContext from '../auth/AuthContext';

export default function EditProfileModal({ isOpen, onClose }) {
  const { user, refreshUser } = useContext(AuthContext);
  const [displayName, setDisplayName] = useState(user?.display_name || user?.full_name || '');
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(user?.profile_image_url || null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImageFile(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      let imageUrl = user?.profile_image_url;

      if (profileImageFile) {
        const uploadResult = await UploadFile({ file: profileImageFile });
        if (uploadResult && uploadResult.file_url) {
          imageUrl = uploadResult.file_url;
        } else {
          throw new Error('Image upload failed.');
        }
      }
      
      await User.updateMyUserData({
        display_name: displayName,
        profile_image_url: imageUrl,
      });

      await refreshUser();
      onClose();

    } catch (err) {
      console.error("Failed to update profile:", err);
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          onClick={(e) => e.stopPropagation()}
        >
          <Card className="w-full max-w-md shadow-2xl border-0">
            <form onSubmit={handleSubmit}>
              <CardHeader className="flex flex-row items-start justify-between">
                <div>
                  <CardTitle className="text-2xl">Edit Profile</CardTitle>
                  <p className="text-slate-500 text-sm">Update your display name and photo.</p>
                </div>
                <Button variant="ghost" size="icon" onClick={onClose} type="button">
                  <X className="w-5 h-5" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-full bg-slate-200 overflow-hidden relative group">
                    {previewImage ? (
                      <img src={previewImage} alt="Profile Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-teal-400 to-cyan-500">
                        <UserIcon className="w-8 h-8 text-white" />
                      </div>
                    )}
                     <label htmlFor="profile-upload" className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                        <Upload className="w-6 h-6 text-white" />
                    </label>
                    <input id="profile-upload" type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                  </div>
                  <div>
                    <label htmlFor="display_name" className="block text-sm font-medium text-slate-700 mb-1">
                      Display Name
                    </label>
                    <Input
                      id="display_name"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Enter your display name"
                      className="text-base"
                    />
                  </div>
                </div>

                {error && <p className="text-sm text-red-500 text-center">{error}</p>}

              </CardContent>
              <CardFooter className="bg-slate-50 p-4 rounded-b-xl flex justify-end gap-3">
                <Button variant="outline" onClick={onClose} type="button">
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading} className="btn-primary">
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}