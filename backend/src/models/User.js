const bcrypt = require('bcryptjs');

// User model for Supabase
class User {
  constructor(data = {}) {
    this.id = data.id;
    this.name = data.name;
    this.email = data.email;
    this.password = data.password;
    this.role = data.role || 'user';
    this.avatar = data.avatar || null;
    this.isActive = data.isActive !== false;
    this.preferences = data.preferences || {
      language: 'en',
      theme: 'system'
    };
    this.favorites = data.favorites || [];
    this.favoriteType = data.favoriteType || [];
    this.lastLogin = data.lastLogin || null;
    this.emailVerified = data.emailVerified || false;
    this.emailVerificationToken = data.emailVerificationToken || null;
    this.passwordResetToken = data.passwordResetToken || null;
    this.passwordResetExpires = data.passwordResetExpires || null;
    this.created_at = data.created_at || new Date();
    this.updated_at = data.updated_at || new Date();
  }

  // Static methods for database operations
  static async findByEmail(email) {
    if (!global.supabase) {
      throw new Error('Supabase not initialized');
    }
    
    const { data, error } = await global.supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();
    
    if (error) return null;
    return new User(data);
  }

  static async findById(id) {
    if (!global.supabase) {
      throw new Error('Supabase not initialized');
    }
    
    const { data, error } = await global.supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) return null;
    return new User(data);
  }

  async save() {
    if (!global.supabase) {
      throw new Error('Supabase not initialized');
    }

    if (this.id) {
      // Update existing user
      const { data, error } = await global.supabase
        .from('users')
        .update({
          name: this.name,
          email: this.email,
          role: this.role,
          avatar: this.avatar,
          isActive: this.isActive,
          preferences: this.preferences,
          favorites: this.favorites,
          favoriteType: this.favoriteType,
          lastLogin: this.lastLogin,
          emailVerified: this.emailVerified,
          emailVerificationToken: this.emailVerificationToken,
          passwordResetToken: this.passwordResetToken,
          passwordResetExpires: this.passwordResetExpires,
          updated_at: new Date()
        })
        .eq('id', this.id)
        .select()
        .single();
      
      if (error) throw error;
      return new User(data);
    } else {
      // Create new user
      const { data, error } = await global.supabase
        .from('users')
        .insert({
          name: this.name,
          email: this.email,
          password: this.password,
          role: this.role,
          avatar: this.avatar,
          isActive: this.isActive,
          preferences: this.preferences,
          favorites: this.favorites,
          favoriteType: this.favoriteType,
          lastLogin: this.lastLogin,
          emailVerified: this.emailVerified,
          emailVerificationToken: this.emailVerificationToken,
          passwordResetToken: this.passwordResetToken,
          passwordResetExpires: this.passwordResetExpires
        })
        .select()
        .single();
      
      if (error) throw error;
      return new User(data);
    }
  }

  async comparePassword(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
  }

  static async hashPassword(password) {
    return bcrypt.hash(password, 12);
  }
}

module.exports = User;
