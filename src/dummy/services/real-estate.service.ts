// src/real-estate/services/real-estate.service.ts
import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class RealEstateService {
  private users = [
    {
      id: 'f8c3de3d-1fea-4d7c-a8b0-29f63c4c3454',
      username: 'user123',
      email: 'user@example.com',
      password: 'Password123!',
      fullName: 'محمد أحمد',
      phoneNumber: '0501234567',
      profilePictureUrl: 'https://randomuser.me/api/portraits/men/1.jpg',
      createdAt: '2025-02-15T09:30:00',
    },
  ];

  private properties = [
    {
      id: '5f8c3de3d-1fea-4d7c-a8b0-29f63c4c3454',
      title: 'شقة فاخرة في وسط الرياض',
      description: 'شقة حديثة مع إطلالة رائعة على المدينة. تتميز بتشطيبات فاخرة ومساحات واسعة ومطبخ مجهز بالكامل. قريبة من المراكز التجارية والمدارس والحدائق. تشمل مواقف سيارات خاصة وخدمات أمن على مدار الساعة.',
      price: 450000,
      area: 120,
      bedrooms: 2,
      bathrooms: 2,
      propertyType: 'apartment',
      location: 'الرياض، حي العليا',
      address: 'شارع التحلية، برج السلام، الطابق الخامس، شقة 503',
      latitude: 24.7136,
      longitude: 46.6753,
      features: [
        'مطبخ مجهز',
        'تكييف مركزي',
        'موقف سيارات',
        'أمن 24 ساعة',
        'قريب من المراكز التجارية',
      ],
      images: [
        {
          id: '1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p',
          url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267',
          description: 'غرفة المعيشة',
        },
        {
          id: '2b3c4d5e-6f7g-8h9i-0j1k-2l3m4n5o6p7q',
          url: 'https://images.unsplash.com/photo-1560448204-603b3fc33ddc',
          description: 'المطبخ',
        },
        {
          id: '3c4d5e6f-7g8h-9i0j-1k2l-3m4n5o6p7q8r',
          url: 'https://images.unsplash.com/photo-1560185007-cde436f6a4d0',
          description: 'غرفة النوم الرئيسية',
        },
      ],
      mainImageUrl: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267',
      owner: {
        id: '7d8e9f0a-1b2c-3d4e-5f6g-7h8i9j0k1l2m',
        name: 'أحمد محمد',
        phoneNumber: '0509876543',
        email: 'ahmed@example.com',
      },
      isAvailable: true,
      createdAt: '2025-03-01T12:00:00',
      updatedAt: '2025-03-10T09:15:00',
    },
    {
      id: '6a9b2c8d-3e4f-5a6b-7c8d-9e0f1a2b3c4d',
      title: 'فيلا واسعة مع حديقة',
      description: 'فيلا فاخرة مع مسبح خاص وحديقة كبيرة',
      price: 950000,
      area: 350,
      bedrooms: 4,
      bathrooms: 3,
      propertyType: 'villa',
      location: 'الرياض، حي الملقا',
      latitude: 24.7914,
      longitude: 46.6382,
      mainImageUrl: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6',
      isAvailable: true,
      createdAt: '2025-03-05T14:30:00',
    },
  ];

  private bookings = [
    {
      id: '8d9e0f1a-2b3c-4d5e-6f7g-8h9i0j1k2l3m',
      propertyId: '5f8c3de3d-1fea-4d7c-a8b0-29f63c4c3454',
      userId: 'f8c3de3d-1fea-4d7c-a8b0-29f63c4c3454',
      status: 'pending',
      requestDate: '2025-04-15T10:00:00',
      message: 'أرغب في معاينة العقار بأقرب وقت ممكن',
      contactPhone: '0501234567',
      createdAt: '2025-03-20T15:45:00',
      property: {
        title: 'شقة فاخرة في وسط الرياض',
        mainImageUrl: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267',
        location: 'الرياض، حي العليا',
        price: 450000,
      },
    },
  ];

  private favorites = [
    {
      id: 'a1b2c3d4-e5f6-7g8h-9i0j-1k2l3m4n5o6p',
      propertyId: '5f8c3de3d-1fea-4d7c-a8b0-29f63c4c3454',
      userId: 'f8c3de3d-1fea-4d7c-a8b0-29f63c4c3454',
      addedAt: '2025-03-20T10:15:00',
      property: {
        title: 'شقة فاخرة في وسط الرياض',
        price: 450000,
        location: 'الرياض، حي العليا',
        bedrooms: 2,
        area: 120,
        mainImageUrl: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267',
        isAvailable: true,
      },
    },
  ];

  // Auth methods
  login(credentials: any) {
    const { email, password } = credentials;
    const user = this.users.find(
      (u) => u.email === email && u.password === password,
    );

    if (!user) {
      return null;
    }

    return {
      token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      expiration: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      userId: user.id,
      username: user.username,
    };
  }

  register(userData: any) {
    const id = uuidv4();
    const newUser = {
      id,
      ...userData,
      createdAt: new Date().toISOString(),
    };

    this.users.push(newUser);
    return {
      success: true,
      message: 'تم تسجيل المستخدم بنجاح',
      userId: id,
    };
  }

  // Property methods
  getAllProperties(filter: any = {}) {
    let filteredProperties = [...this.properties];

    if (filter.propertyType) {
      filteredProperties = filteredProperties.filter(
        (p) => p.propertyType === filter.propertyType,
      );
    }

    if (filter.location) {
      filteredProperties = filteredProperties.filter((p) =>
        p.location.includes(filter.location),
      );
    }

    if (filter.bedrooms) {
      filteredProperties = filteredProperties.filter(
        (p) => p.bedrooms >= filter.bedrooms,
      );
    }

    if (filter.minPrice) {
      filteredProperties = filteredProperties.filter(
        (p) => p.price >= filter.minPrice,
      );
    }

    if (filter.maxPrice) {
      filteredProperties = filteredProperties.filter(
        (p) => p.price <= filter.maxPrice,
      );
    }

    const page = filter.page || 1;
    const pageSize = filter.pageSize || 10;
    const startIndex = (page - 1) * pageSize;
    const paginatedProperties = filteredProperties.slice(
      startIndex,
      startIndex + pageSize,
    );

    return {
      totalCount: filteredProperties.length,
      totalPages: Math.ceil(filteredProperties.length / pageSize),
      currentPage: page,
      pageSize,
      properties: paginatedProperties,
    };
  }

  searchProperties(query: string, page = 1, pageSize = 10) {
    const filteredProperties = this.properties.filter(
      (p) =>
        p.title.includes(query) ||
        p.description.includes(query) ||
        p.location.includes(query),
    );

    const startIndex = (page - 1) * pageSize;
    const paginatedProperties = filteredProperties.slice(
      startIndex,
      startIndex + pageSize,
    );

    return {
      totalCount: filteredProperties.length,
      totalPages: Math.ceil(filteredProperties.length / pageSize),
      currentPage: page,
      pageSize,
      properties: paginatedProperties,
    };
  }

  getPropertyById(id: string) {
    return this.properties.find((p) => p.id === id);
  }

  // Booking methods
  getUserBookings(userId: string, status?: string, page = 1, pageSize = 10) {
    let userBookings = this.bookings.filter((b) => b.userId === userId);

    if (status) {
      userBookings = userBookings.filter((b) => b.status === status);
    }

    const startIndex = (page - 1) * pageSize;
    const paginatedBookings = userBookings.slice(
      startIndex,
      startIndex + pageSize,
    );

    return {
      totalCount: userBookings.length,
      totalPages: Math.ceil(userBookings.length / pageSize),
      currentPage: page,
      pageSize,
      bookings: paginatedBookings,
    };
  }

  createBooking(bookingData: any) {
    const id = uuidv4();
    const property = this.getPropertyById(bookingData.propertyId);
    
    const newBooking = {
      id,
      ...bookingData,
      status: 'pending',
      createdAt: new Date().toISOString(),
      property: {
        title: property.title,
        mainImageUrl: property.mainImageUrl,
        location: property.location,
        price: property.price,
      },
    };

    this.bookings.push(newBooking);
    return newBooking;
  }

  cancelBooking(bookingId: string) {
    const index = this.bookings.findIndex((b) => b.id === bookingId);
    if (index > -1) {
      this.bookings.splice(index, 1);
      return { success: true, message: 'تم إلغاء طلب الحجز بنجاح' };
    }
    return { success: false, message: 'لم يتم العثور على الحجز' };
  }

  // Favorites methods
  getUserFavorites(userId: string, page = 1, pageSize = 10) {
    const userFavorites = this.favorites.filter((f) => f.userId === userId);
    
    const startIndex = (page - 1) * pageSize;
    const paginatedFavorites = userFavorites.slice(
      startIndex,
      startIndex + pageSize,
    );

    return {
      totalCount: userFavorites.length,
      totalPages: Math.ceil(userFavorites.length / pageSize),
      currentPage: page,
      pageSize,
      favorites: paginatedFavorites,
    };
  }

  addToFavorites(userId: string, propertyId: string) {
    const existingFavorite = this.favorites.find(
      (f) => f.userId === userId && f.propertyId === propertyId,
    );

    if (existingFavorite) {
      return { success: false, message: 'العقار موجود بالفعل في المفضلة' };
    }

    const property = this.getPropertyById(propertyId);
    if (!property) {
      return { success: false, message: 'العقار غير موجود' };
    }

    const id = uuidv4();
    const newFavorite = {
      id,
      userId,
      propertyId,
      addedAt: new Date().toISOString(),
      property: {
        title: property.title,
        price: property.price,
        location: property.location,
        bedrooms: property.bedrooms,
        area: property.area,
        mainImageUrl: property.mainImageUrl,
        isAvailable: property.isAvailable,
      },
    };

    this.favorites.push(newFavorite);
    return { success: true, message: 'تمت إضافة العقار إلى المفضلة' };
  }

  removeFromFavorites(userId: string, propertyId: string) {
    const index = this.favorites.findIndex(
      (f) => f.userId === userId && f.propertyId === propertyId,
    );

    if (index > -1) {
      this.favorites.splice(index, 1);
      return { success: true, message: 'تمت إزالة العقار من المفضلة' };
    }

    return { success: false, message: 'العقار غير موجود في المفضلة' };
  }

  // User methods
  getUserProfile(userId: string) {
    const user = this.users.find((u) => u.id === userId);
    if (!user) return null;

    const { password, ...userProfile } = user;
    return userProfile;
  }

  updateUserProfile(userId: string, data: any) {
    const userIndex = this.users.findIndex((u) => u.id === userId);
    if (userIndex === -1) return null;

    const updatedUser = {
      ...this.users[userIndex],
      ...data,
      updatedAt: new Date().toISOString(),
    };

    this.users[userIndex] = updatedUser;
    const { password, ...userProfile } = updatedUser;

    return {
      success: true,
      message: 'تم تحديث الملف الشخصي بنجاح',
      profile: userProfile,
    };
  }

  changePassword(userId: string, data: any) {
    const { currentPassword, newPassword } = data;
    const userIndex = this.users.findIndex(
      (u) => u.id === userId && u.password === currentPassword,
    );

    if (userIndex === -1) {
      return { success: false, message: 'كلمة المرور الحالية غير صحيحة' };
    }

    this.users[userIndex].password = newPassword;
    return { success: true, message: 'تم تغيير كلمة المرور بنجاح' };
  }
}