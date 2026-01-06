{% load static %}

<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Noto+Serif+Bengali:wght@400;600;700&family=Noto+Serif:wght@400;600;700&display=swap" rel="stylesheet">

<style>
    /* Smooth scroll behavior */
    html { scroll-behavior: smooth; }
    .footer-font { font-family: 'Noto Serif Bengali', 'Noto Serif', serif; }
    .social-icon { width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border-radius: 50%; color: white; transition: opacity 0.3s; }
    .social-icon:hover { opacity: 0.8; }
</style>

<footer class="bg-white text-gray-800 border-t-4 border-gray-200 pt-8 pb-4 footer-font">
    <div class="container mx-auto px-4 lg:px-8">
        
        <div class="flex flex-col lg:flex-row justify-between items-start gap-8 mb-6">
            
            <div class="w-full lg:w-1/4 flex flex-col gap-3">
                {% if site_config %}
                    <div>
                        <a href="{% url 'home' %}" class="inline-block">
                            {% if site_config.logo %}
                                <img src="{{ site_config.logo.url }}" alt="{{ site_config.site_title }}" class="h-12 transition-transform hover:scale-105">
                            {% else %}
                                <img src="{% static 'img/logo.jpg' %}" alt="বর্তমান টাইমস" class="h-12 transition-transform hover:scale-105">
                            {% endif %}
                        </a>
                    </div>
                {% endif %}

                <div class="text-sm text-gray-700 leading-relaxed text-justify max-w-2xl">
                    {% if company_info.footer_text %}
                        {{ company_info.footer_text|safe|striptags }}
                    {% elif company_info.description %}
                        {{ company_info.description|safe|striptags }}
                    {% else %}
                        বাংলাদেশ ও বিশ্বের সকল খবর, ব্রেকিং নিউজ, লাইভ নিউজ, রাজনীতি, বাণিজ্য, খেলা, বিনোদনসহ সকল সর্বশেষ সংবাদ সবার আগে পড়তে ক্লিক করুন বর্তমান টাইমস ডট কম।
                    {% endif %}
                </div>
            </div>

            <div class="w-full lg:w-3/4 flex flex-col items-start lg:items-end">
                <div class="flex flex-wrap gap-x-4 gap-y-2 text-sm font-semibold text-gray-700 justify-start lg:justify-end mb-2">
                    <a href="#" class="hover:text-blue-600">বর্তমান টাইমস</a>
                    <a href="#" class="hover:text-blue-600">গোপনীয়তার নীতি</a>
                    <a href="#" class="hover:text-blue-600">শর্তাবলি</a>
                    <a href="#" class="hover:text-blue-600">মন্তব্য প্রকাশের নীতিমালা</a>
                    <a href="#" class="hover:text-blue-600">বাংলা কনভার্টার</a>
                    <a href="#" class="hover:text-blue-600">বিজ্ঞাপন</a>
                    <a href="#" class="hover:text-blue-600">যোগাযোগ</a>
                </div>
                <div class="flex flex-wrap gap-x-4 gap-y-2 text-sm font-semibold text-gray-700 justify-start lg:justify-end">
                    <a href="#" class="hover:text-blue-600">ছুটির তালিকা</a>
                    <a href="#" class="hover:text-blue-600">দিবস</a>
                </div>
            </div>
        </div>

        <div class="border-t border-gray-300 my-4"></div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 my-5">
            
            <div class="text-sm text-gray-800 leading-7">
                {% if editorial_info %}
                    {% for editor in editorial_info %}
                        {% if forloop.first %}
                            <p>
                                <span class="font-bold">সম্পাদক: {{ editor.name|default:"মোঃ আব্দুল আজিজ জিলাদার" }}</span> | 
                                <span class="font-bold">প্রকাশক: {{ editor.publisher|default:"মোঃ আব্দুল আজিজ জিলাদার" }}</span> | 
                                <span class="font-bold">বিভাগীয় প্রধান (অনলাইন): {{ editor.head_online|default:"মোঃ আব্দুল আজিজ জিলাদার" }}</span>
                            </p>
                            {% if contact_info %}
                            <p class="mt-2">
                                মালতিনগর, এমএসক্লাব মাঠ লেন, বগুড়া সদর, বগুড়া।
                            </p>
                            {% endif %}
                        {% endif %}
                    {% endfor %}
                {% else %}
                    <p><span class="font-bold">সম্পাদক: মোঃ আব্দুল আজিজ জিলাদার</span> | <span class="font-bold">প্রকাশক মোঃ আব্দুল আজিজ জিলাদার</span> | <span class="font-bold">বিভাগীয় প্রধান (অনলাইন): পলাশ মাহমুদ</span></p>
                    <p class="mt-2">ঠিকানাঃ মালতিনগর, এমএসক্লাব মাঠ লেন, বগুড়া সদর, বগুড়া।</p>
                {% endif %}
            </div

            <div class="text-sm text-gray-800 leading-7 lg:text-right">
                {% if contact_info %}
                    {% for contact in contact_info|slice:":1" %}
                        <p>ফোন : {{ contact.phone|default:"+8801761292947, +৮৮ ০২ xxxxxxx" }} | ফ্যাক্স : +৮৮ ০২ ৪৪৬১৭০০২</p>
                        <p>ই-মেইল: {{ contact.email|default:"news@bortomantimes.com" }}</p>
                        <p>বিজ্ঞাপন বিভাগ: ফোন: {{ contact.ad_phone|default:"+৮৮ ০২ xxxx, ০১৭৩০ ০৯৬৩২৮" }} | ই-মেইল: ads@bortomantimes.com</p>
                        <p>সার্কুলেশন : ফোন: ০১৭xxxxxxxxx | বর্তমান টাইমস মিডিয়া লিমিটেডের একটি প্রকাশনা।</p>
                    {% endfor %}
                {% else %}
                    <p>ফোন : +8801761292947, +8801761292947 | ফ্যাক্স : +৮৮ xxxxxxxxxxx</p>
                    <p>ই-মেইল: news@bortomantimes.com</p>
                    <p>বিজ্ঞাপন বিভাগ: ফোন: +৮৮ ০xxxxxxx, ০১৭xxxxxxx | ই-মেইল: info@bortomantimes.com</p>
                    <p>সার্কুলেশন : ফোন: ০১৭xxxxxxxxx | বর্তমান টাইমস মিডিয়া লিমিটেডের একটি প্রকাশনা।</p>
                {% endif %}
            </div>
        </div>

        <div class="border-t border-gray-300 my-4"></div>

        <div class="flex flex-col lg:flex-row justify-between items-center gap-6 my-4">
            
            <div class="flex items-center gap-3">
                <div class="text-2xl text-gray-800 mr-2"><i class="fas fa-share-alt"></i></div>
                <span class="font-bold text-gray-700 mr-2">সোশ্যাল মিডিয়া</span>
                
                {% if social_links %}
                    <div class="flex gap-2">
                        {% for social in social_links %}
                            <a href="{{ social.url }}" target="_blank" 
                               class="social-icon"
                               style="background-color: {% if 'facebook' in social.platform.lower %}#1877F2{% elif 'youtube' in social.platform.lower %}#FF0000{% elif 'twitter' in social.platform.lower %}#1DA1F2{% elif 'linkedin' in social.platform.lower %}#0A66C2{% elif 'instagram' in social.platform.lower %}#E4405F{% else %}#333{% endif %};">
                                <i class="{{ social.icon_class|default:'fas fa-link' }}"></i>
                            </a>
                        {% endfor %}
                    </div>
                {% else %}
                    <a href="#" class="social-icon bg-blue-600"><i class="fab fa-facebook-f"></i></a>
                    <a href="#" class="social-icon bg-red-600"><i class="fab fa-youtube"></i></a>
                    <a href="#" class="social-icon bg-blue-400"><i class="fab fa-twitter"></i></a>
                    <a href="#" class="social-icon bg-blue-700"><i class="fab fa-linkedin-in"></i></a>
                    <a href="#" class="social-icon bg-pink-600"><i class="fab fa-instagram"></i></a>
                {% endif %}
            </div>

            <div class="flex flex-col md:flex-row items-center gap-6">
                <div class="flex items-center gap-2">
                    <div class="text-2xl text-gray-700"><i class="far fa-envelope"></i></div>
                    <div class="text-sm">
                        <span class="font-bold block">নিউজলেটার</span>
                        <span class="text-gray-600">বর্তমান টাইমস থেকে প্রতিদিন মেইলে আপডেট পেতে সাবস্ক্রাইব করুন।</span>
                    </div>
                </div>

                <div class="flex items-center gap-2 border-l-0 md:border-l border-gray-300 pl-0 md:pl-4">
                    <div class="text-2xl text-gray-700"><i class="fas fa-mobile-alt"></i></div>
                    <div class="flex flex-col text-sm font-bold">
                        <span>মোবাইল অ্যাপস</span>
                        <div class="flex gap-2 text-xs font-normal mt-1">
                            <a href="#" class="flex items-center hover:text-blue-600"><i class="fas fa-external-link-alt mr-1"></i> অ্যান্ড্রয়েড</a>
                            <a href="#" class="flex items-center hover:text-blue-600"><i class="fas fa-external-link-alt mr-1"></i> আইফোন</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="bg-gray-100 mt-6 py-4 -mx-4 lg:-mx-8 px-4 lg:px-8">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600 items-center">
                <div class="text-center md:text-left">
                    <span>স্বত্ব © বর্তমান টাইমস মিডিয়া লিমিটেড ২০২৫</span><br>
                    <span>ওয়েবসাইটের কোনো লেখা, ছবি, ভিডিও অনুমতি ছাড়া ব্যবহার বেআইনি।</span>
                </div>
                <div class="text-center md:text-right mt-2 md:mt-0">
                    <a href="https://www.exeyezone.com" target="_blank" rel="noopener noreferrer" class="font-bold lato inter text-gray-800 hover:text-red-500" style="font-family: 'Noto Serif', serif;">exeyezone</a>
                    <span>প্রতিষ্ঠান দ্বারা নির্মিত</span>
                </div>
            </div>
        </div>
    </div>

    <button onclick="window.scrollTo({top: 0, behavior: 'smooth'})" 
            class="fixed bottom-6 right-6 w-10 h-10 bg-gray-700 text-white rounded shadow-lg hover:bg-gray-900 transition-all z-50 flex items-center justify-center">
        <i class="fas fa-chevron-up"></i>
    </button>
</footer>