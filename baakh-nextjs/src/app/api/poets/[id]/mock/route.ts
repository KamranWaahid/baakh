export const runtime = 'edge'
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: poetSlug } = await params;
    const { searchParams } = new URL(request.url);
    const lang = searchParams.get('lang') || 'en';
    
    console.log('Mock poet API - Poet slug:', poetSlug, 'Language:', lang);
    
    // Mock poet data - Qazi Qadan specific
    const isQaziQadan = poetSlug === 'qazi-qadan';
    
    const mockPoet = isQaziQadan ? {
      id: '2',
      poetNumericId: 2,
      poet_slug: 'qazi-qadan',
      name: lang === 'sd' ? 'قاضي قادن' : 'Qazi Qadan',
      sindhiName: 'قاضي قادن',
      englishName: 'Qazi Qadan',
      sindhi_laqab: 'قاضي قادن',
      english_laqab: 'Qazi Qadan',
      sindhi_takhalus: 'قادن',
      english_takhalus: 'Qadan',
      sindhi_tagline: 'صوفي شاعر ۽ عالم',
      english_tagline: 'Sufi Poet and Scholar',
      birth_date: '1463',
      death_date: '1551',
      period: '1463 - 1551',
      birth_place: 'سنڌ',
      death_place: 'سنڌ',
      birth_place_sd: 'سنڌ',
      birth_place_en: 'Sindh',
      death_place_sd: 'سنڌ',
      death_place_en: 'Sindh',
      tags: ['صوفي', 'sufi', 'شاعر', 'poet', 'عالم', 'scholar'],
      is_featured: true,
      is_hidden: false,
      file_url: '/default-avatar.png',
      avatar: '/default-avatar.png',
      description: lang === 'sd' 
        ? 'قاضي قادن هڪ مشهور سنڌي صوفي شاعر ۽ عالم هو.'
        : 'Qazi Qadan was a renowned Sindhi Sufi poet and scholar.',
      longDescription: lang === 'sd' 
        ? 'قاضي قادن (1463-1551) هڪ مشهور سنڌي صوفي شاعر، عالم ۽ قاضي هو. هن سنڌي شاعري ۾ وڏو ڪردار ادا ڪيو ۽ صوفي تعليمات کي شاعري جي صورت ۾ پيش ڪيو. هن جي شاعري ۾ صوفي تعليمات، محبت، ۽ روحاني تجربات جا موضوع شامل آهن. هن سنڌي ادب ۾ وڏو ڪردار ادا ڪيو ۽ هن جي شاعري اڄ به سنڌي ثقافت جو اهم حصو آهي. هن جي شاعري ۾ صوفي تعليمات، محبت، ۽ روحاني تجربات جا موضوع شامل آهن. هن سنڌي ادب ۾ وڏو ڪردار ادا ڪيو ۽ هن جي شاعري اڄ به سنڌي ثقافت جو اهم حصو آهي.'
        : 'Qazi Qadan (1463-1551) was a renowned Sindhi Sufi poet, scholar, and judge. He played a significant role in Sindhi poetry and presented Sufi teachings through poetry. His poetry covers themes of Sufi teachings, love, and spiritual experiences. He played a significant role in Sindhi literature and his poetry remains an important part of Sindhi culture today. His works continue to inspire readers and scholars of Sindhi literature.',
      // Use the proper database fields
      english_details: 'Qazi Qadan (1463-1551) was a renowned Sindhi Sufi poet, scholar, and judge. He played a significant role in Sindhi poetry and presented Sufi teachings through poetry. His poetry covers themes of Sufi teachings, love, and spiritual experiences. He played a significant role in Sindhi literature and his poetry remains an important part of Sindhi culture today. His works continue to inspire readers and scholars of Sindhi literature.',
      sindhi_details: 'قاضي قادن (1463-1551) هڪ مشهور سنڌي صوفي شاعر، عالم ۽ قاضي هو. هن سنڌي شاعري ۾ وڏو ڪردار ادا ڪيو ۽ صوفي تعليمات کي شاعري جي صورت ۾ پيش ڪيو. هن جي شاعري ۾ صوفي تعليمات، محبت، ۽ روحاني تجربات جا موضوع شامل آهن. هن سنڌي ادب ۾ وڏو ڪردار ادا ڪيو ۽ هن جي شاعري اڄ به سنڌي ثقافت جو اهم حصو آهي. هن جي شاعري ۾ صوفي تعليمات، محبت، ۽ روحاني تجربات جا موضوع شامل آهن. هن سنڌي ادب ۾ وڏو ڪردار ادا ڪيو ۽ هن جي شاعري اڄ به سنڌي ثقافت جو اهم حصو آهي.',
      stats: {
        works: 25,
        couplets: 120,
        nazams: 12,
        vaayis: 8
      },
      categories: [],
      couplets: [
        {
          id: 1,
          lines: lang === 'sd' 
            ? ['محبت جي راھ تي چلو', 'دل کي صاف رکو']
            : ['Walk on the path of love', 'Keep your heart pure'],
          translatedTags: ['محبت', 'love', 'صوفي', 'sufi'],
          likes: 45,
          views: 280,
          poetry_id: null
        },
        {
          id: 2,
          lines: lang === 'sd' 
            ? ['الله جي ياد ۾ رهو', 'دل کي سڪون ملي']
            : ['Stay in remembrance of Allah', 'Find peace in your heart'],
          translatedTags: ['الله', 'allah', 'ياد', 'remembrance'],
          likes: 38,
          views: 220,
          poetry_id: null
        },
        {
          id: 3,
          lines: lang === 'sd' 
            ? ['دنيوي مال کان وڌيڪ', 'روحاني دولت کي ترجيح ڏيو']
            : ['More than worldly wealth', 'Prioritize spiritual riches'],
          translatedTags: ['روحاني', 'spiritual', 'دنيوي', 'worldly'],
          likes: 42,
          views: 195,
          poetry_id: null
        },
        {
          id: 4,
          lines: lang === 'sd' 
            ? ['صبر جو پھلو اپنايو', 'مشڪلات کان نہ ڊرو']
            : ['Embrace the virtue of patience', 'Do not fear difficulties'],
          translatedTags: ['صبر', 'patience', 'مشڪلات', 'difficulties'],
          likes: 35,
          views: 180,
          poetry_id: null
        },
        {
          id: 5,
          lines: lang === 'sd' 
            ? ['سچائي جي راھ تي چلو', 'ڪوڙ کان بچو']
            : ['Walk on the path of truth', 'Avoid falsehood'],
          translatedTags: ['سچائي', 'truth', 'ڪوڙ', 'falsehood'],
          likes: 40,
          views: 210,
          poetry_id: null
        },
        {
          id: 6,
          lines: lang === 'sd' 
            ? ['دوسرن سان اچيت پيار', 'انسانيت جو درس ڏيو']
            : ['Show love to others', 'Teach the lesson of humanity'],
          translatedTags: ['پيار', 'love', 'انسانيت', 'humanity'],
          likes: 33,
          views: 165,
          poetry_id: null
        }
      ],
      nazams: [
        {
          id: 1,
          title: lang === 'sd' ? 'صوفي راھ' : 'Sufi Path',
          description: lang === 'sd' ? 'صوفي تعليمات بابت نظم' : 'Nazm about Sufi teachings'
        },
        {
          id: 2,
          title: lang === 'sd' ? 'محبت جو گيت' : 'Song of Love',
          description: lang === 'sd' ? 'محبت ۽ روحانيت بابت نظم' : 'Nazm about love and spirituality'
        }
      ],
      vaayis: [
        {
          id: 1,
          title: lang === 'sd' ? 'الله جي ياد' : 'Remembrance of Allah',
          description: lang === 'sd' ? 'عبادي شاعري' : 'Devotional poetry'
        }
      ],
      similarPoets: [
        {
          id: '1',
          name: lang === 'sd' ? 'شاهه عبداللطيف' : 'Shah Abdul Latif',
          avatar: '/default-avatar.png',
          period: '1689 - 1752'
        },
        {
          id: '3',
          name: lang === 'sd' ? 'سچل سرمست' : 'Sachal Sarmast',
          avatar: '/default-avatar.png',
          period: '1739 - 1829'
        },
        {
          id: '4',
          name: lang === 'sd' ? 'شاهه عنايت' : 'Shah Inayat',
          avatar: '/default-avatar.png',
          period: '1613 - 1701'
        }
      ]
    } : {
      // Default poet data for other poets
      id: '1',
      poetNumericId: 1,
      poet_slug: 'naveeda',
      name: lang === 'sd' ? 'نويدا' : 'Naveeda',
      sindhiName: 'نويدا',
      englishName: 'Naveeda',
      sindhi_laqab: 'نويدا',
      english_laqab: 'Naveeda',
      sindhi_takhalus: 'نويدا',
      english_takhalus: 'Naveeda',
      sindhi_tagline: 'شاعر',
      english_tagline: 'Poet',
      birth_date: '1950',
      death_date: null,
      period: '1950 - Present',
      birth_place: 'سنڌ',
      death_place: null,
      birth_place_sd: 'سنڌ',
      birth_place_en: 'Sindh',
      death_place_sd: null,
      death_place_en: null,
      tags: ['شاعر', 'poet', 'محبت', 'love'],
      is_featured: false,
      is_hidden: false,
      file_url: '/default-avatar.png',
      avatar: '/default-avatar.png',
      description: lang === 'sd' 
        ? 'نويدا هڪ مشهور سنڌي شاعر آهي جيڪو سنڌي شاعري ۾ وڏو ڪردار ادا ڪيو آهي.'
        : 'Naveeda is a renowned Sindhi poet who has made significant contributions to Sindhi poetry.',
      longDescription: lang === 'sd' 
        ? 'نويدا هڪ مشهور سنڌي شاعر آهي جيڪو سنڌي شاعري ۾ وڏو ڪردار ادا ڪيو آهي. هن جي شاعري ۾ محبت، وطن دوستي ۽ سماجي مسائل جا موضوع شامل آهن.'
        : 'Naveeda is a renowned Sindhi poet who has made significant contributions to Sindhi poetry. Her poetry covers themes of love, patriotism, and social issues.',
      english_details: 'Naveeda is a renowned Sindhi poet who has made significant contributions to Sindhi poetry. Her poetry covers themes of love, patriotism, and social issues.',
      sindhi_details: 'نويدا هڪ مشهور سنڌي شاعر آهي جيڪو سنڌي شاعري ۾ وڏو ڪردار ادا ڪيو آهي. هن جي شاعري ۾ محبت، وطن دوستي ۽ سماجي مسائل جا موضوع شامل آهن.',
      stats: {
        works: 15,
        couplets: 45,
        nazams: 8,
        vaayis: 2
      },
      categories: [],
      couplets: [
        {
          id: 1,
          lines: lang === 'sd' 
            ? ['سنڌ جي مٽي ۾ پيدا ٿيل', 'محبت جا گيت گاتا آهيون']
            : ['Born in the soil of Sindh', 'We sing songs of love'],
          translatedTags: [],
          likes: 25,
          views: 150,
          poetry_id: null
        },
        {
          id: 2,
          lines: lang === 'sd' 
            ? ['ڪجهه ڪجهه ڪجهه ڪجهه', 'ڪجهه ڪجهه ڪجهه ڪجهه']
            : ['Something something something', 'Something something something'],
          translatedTags: [],
          likes: 18,
          views: 120,
          poetry_id: null
        },
        {
          id: 3,
          lines: lang === 'sd' 
            ? ['ڪجهه ڪجهه ڪجهه ڪجهه', 'ڪجهه ڪجهه ڪجهه ڪجهه']
            : ['Something something something', 'Something something something'],
          translatedTags: [],
          likes: 12,
          views: 95,
          poetry_id: null
        }
      ],
      nazams: [],
      vaayis: [],
      similarPoets: [
        {
          id: '2',
          name: lang === 'sd' ? 'شاهه عبداللطيف' : 'Shah Abdul Latif',
          avatar: '/default-avatar.png',
          period: '1689 - 1752'
        },
        {
          id: '3',
          name: lang === 'sd' ? 'سچل سرمست' : 'Sachal Sarmast',
          avatar: '/default-avatar.png',
          period: '1739 - 1829'
        }
      ]
    };

    // Mock categories data - Qazi Qadan specific
    const mockCategories = isQaziQadan ? [
      {
        id: '1',
        slug: 'sufi-poetry',
        name: lang === 'sd' ? 'صوفي شاعري' : 'Sufi Poetry',
        namePlural: lang === 'sd' ? 'صوفي شاعريون' : 'Sufi Poems',
        description: lang === 'sd' ? 'صوفي تعليمات ۽ روحاني تجربات' : 'Sufi teachings and spiritual experiences',
        poetryCount: 12,
        poetry: [
          {
            id: '1',
            title: lang === 'sd' ? 'صوفي راھ' : 'Sufi Path',
            description: lang === 'sd' ? 'صوفي تعليمات بابت شاعري' : 'Poetry about Sufi teachings',
            slug: 'sufi-rah',
            tags: ['صوفي', 'sufi', 'راھ', 'path'],
            isFeatured: true,
            englishTitle: 'Sufi Path'
          },
          {
            id: '2',
            title: lang === 'sd' ? 'محبت جو گيت' : 'Song of Love',
            description: lang === 'sd' ? 'صوفي محبت بابت شاعري' : 'Sufi poetry about love',
            slug: 'mohabbat-jo-geet',
            tags: ['محبت', 'love', 'صوفي', 'sufi'],
            isFeatured: true,
            englishTitle: 'Song of Love'
          },
          {
            id: '3',
            title: lang === 'sd' ? 'الله جي ياد' : 'Remembrance of Allah',
            description: lang === 'sd' ? 'عبادي شاعري' : 'Devotional poetry',
            slug: 'allah-ji-yad',
            tags: ['الله', 'allah', 'ياد', 'remembrance'],
            isFeatured: false,
            englishTitle: 'Remembrance of Allah'
          }
        ]
      },
      {
        id: '2',
        slug: 'spiritual-couplets',
        name: lang === 'sd' ? 'روحاني شعر' : 'Spiritual Couplets',
        namePlural: lang === 'sd' ? 'روحاني شعر' : 'Spiritual Couplets',
        description: lang === 'sd' ? 'روحاني تعليمات جا شعر' : 'Couplets with spiritual teachings',
        poetryCount: 8,
        poetry: [
          {
            id: '4',
            title: lang === 'sd' ? 'صبر جو درس' : 'Lesson of Patience',
            description: lang === 'sd' ? 'صبر بابت شعر' : 'Couplets about patience',
            slug: 'sabar-jo-dars',
            tags: ['صبر', 'patience', 'درس', 'lesson'],
            isFeatured: true,
            englishTitle: 'Lesson of Patience'
          },
          {
            id: '5',
            title: lang === 'sd' ? 'سچائي جي راھ' : 'Path of Truth',
            description: lang === 'sd' ? 'سچائي بابت شعر' : 'Couplets about truth',
            slug: 'sachai-ji-rah',
            tags: ['سچائي', 'truth', 'راھ', 'path'],
            isFeatured: false,
            englishTitle: 'Path of Truth'
          }
        ]
      },
      {
        id: '3',
        slug: 'devotional-poetry',
        name: lang === 'sd' ? 'عبادي شاعري' : 'Devotional Poetry',
        namePlural: lang === 'sd' ? 'عبادي شاعريون' : 'Devotional Poems',
        description: lang === 'sd' ? 'عبادت ۽ عبادت بابت شاعري' : 'Poetry about worship and devotion',
        poetryCount: 5,
        poetry: [
          {
            id: '6',
            title: lang === 'sd' ? 'دعا جو گيت' : 'Song of Prayer',
            description: lang === 'sd' ? 'دعا بابت شاعري' : 'Poetry about prayer',
            slug: 'dua-jo-geet',
            tags: ['دعا', 'prayer', 'عبادت', 'worship'],
            isFeatured: true,
            englishTitle: 'Song of Prayer'
          }
        ]
      }
    ] : [
      {
        id: '1',
        slug: 'ghazal',
        name: lang === 'sd' ? 'غزل' : 'Ghazal',
        namePlural: lang === 'sd' ? 'غزلون' : 'Ghazals',
        description: lang === 'sd' ? 'غزل شاعري' : 'Ghazal poetry',
        poetryCount: 8,
        poetry: [
          {
            id: '1',
            title: lang === 'sd' ? 'محبت جو گيت' : 'Song of Love',
            description: lang === 'sd' ? 'محبت بابت غزل' : 'Ghazal about love',
            slug: 'mohabbat-jo-geet',
            tags: ['محبت', 'love'],
            isFeatured: true,
            englishTitle: 'Song of Love'
          },
          {
            id: '2',
            title: lang === 'sd' ? 'وطن دوستي' : 'Patriotism',
            description: lang === 'sd' ? 'وطن بابت غزل' : 'Ghazal about homeland',
            slug: 'watan-dosti',
            tags: ['وطن', 'patriotism'],
            isFeatured: false,
            englishTitle: 'Patriotism'
          }
        ]
      },
      {
        id: '2',
        slug: 'nazm',
        name: lang === 'sd' ? 'نظم' : 'Nazm',
        namePlural: lang === 'sd' ? 'نظمون' : 'Nazms',
        description: lang === 'sd' ? 'نظم شاعري' : 'Nazm poetry',
        poetryCount: 5,
        poetry: [
          {
            id: '3',
            title: lang === 'sd' ? 'سنڌ جو گيت' : 'Song of Sindh',
            description: lang === 'sd' ? 'سنڌ بابت نظم' : 'Nazm about Sindh',
            slug: 'sindh-jo-geet',
            tags: ['سنڌ', 'sindh'],
            isFeatured: true,
            englishTitle: 'Song of Sindh'
          }
        ]
      }
    ];

    const response = {
      success: true,
      poet: mockPoet,
      categories: mockCategories
    };

    console.log('Mock poet API response:', {
      success: response.success,
      poet: response.poet.name,
      poetryCount: response.poet.stats.works,
      coupletsCount: response.poet.stats.couplets,
      categoriesCount: response.categories.length
    });

    return NextResponse.json(response);
    
  } catch (error) {
    console.error('Mock poet API error:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
