package com.masjed.app.data

import androidx.annotation.ColorInt

data class QuickAction(
    val title: String,
    val description: String,
    val icon: String,
    val destination: String,
    val disabled: Boolean = false,
    @ColorInt val accentStart: Int,
    @ColorInt val accentEnd: Int
)

data class Announcement(
    val title: String,
    val body: String,
    val highlight: String? = null
)

data class Hadith(
    val text: String,
    val translation: String,
    val source: String
)

data class DailyPrayer(
    val dayIndex: Int,
    val dayLabel: String,
    val title: String,
    val text: String
)

data class DailyEventSet(
    val dayIndex: Int,
    val events: List<String>
)

object HomeContentRepository {

    fun quickActions(): List<QuickAction> = listOf(
        QuickAction(
            title = "ادعیه و زیارات",
            description = "نمایش دعای روز و زیارت مخصوص همان روز",
            icon = "📿",
            destination = "internal_devotional",
            accentStart = 0x4DE2F3EA.toInt(),
            accentEnd = 0x19DCFCE7.toInt()
        ),
        QuickAction(
            title = "وصیتنامه شهدا",
            description = "مروری بر بخشی از وصایای نورانی شهدا",
            icon = "📜",
            destination = "/martyrs-wills",
            accentStart = 0x4D2DD4BF,
            accentEnd = 0x192DD4BF
        ),
        QuickAction(
            title = "داستانهای الهامبخش",
            description = "حکایتهای الهامبخش برای جوانان مسجدی",
            icon = "📘",
            destination = "/inspiring-stories",
            accentStart = 0x4D818CF8,
            accentEnd = 0x19818CF8
        )
    )

    fun announcements(): List<Announcement> = listOf(
        Announcement(
            title = "ویژهبرنامه قرآنی سهشنبهها",
            body = "قرائت جزء‌خوانی و تفسیر کوتاه بعد از نماز مغرب در صحن اصلی مسجد.",
            highlight = "آغاز از این هفته"
        ),
        Announcement(
            title = "پویش کمک مؤمنانه",
            body = "جمعآوری کمکهای نقدی و غیرنقدی برای خانوادههای نیازمند محله تا پایان ماه جاری.",
            highlight = "مسئول: پایگاه بسیج"
        ),
        Announcement(
            title = "ثبتنام اردوی جهادی",
            body = "اعزام گروه جهادی به روستاهای خراسان در تاریخ ۲۵ آذر؛ ثبتنام در واحد فرهنگی."
        )
    )

    fun hadiths(): List<Hadith> = listOf(
        Hadith(
            text = "إِنَّمَا الْمُؤْمِنُونَ إِخْوَةٌ فَأَصْلِحُوا بَيْنَ أَخَوَيْكُمْ",
            translation = "مؤمنان برادر یکدیگرند؛ میان برادران خود اصلاح برقرار کنید.",
            source = "قرآن کریم، سوره حجرات آیه ۱۰"
        ),
        Hadith(
            text = "رَحِمَ اللّٰهُ عَبْدًا أَحْيَا حَقًّا وَأَمَاتَ بَاطِلًا",
            translation = "خدا رحمت کند بنده‌ای را که حقی را زنده و باطلی را نابود سازد.",
            source = "امام علی (ع) - نهج‌البلاغه، خطبه ۱۷۴"
        ),
        Hadith(
            text = "مَنْ ذَكَرَ اللّٰهَ كَثِيرًا أَحَبَّهُ اللّٰهُ كَثِيرًا",
            translation = "هر که بسیار یاد خدا کند، خدا نیز او را بسیار دوست می‌دارد.",
            source = "امام صادق (ع) - کافی، ج ۲، ص ۵۰۳"
        ),
        Hadith(
            text = "أَحَبُّ النَّاسِ إِلَى اللّٰهِ أَنْفَعُهُمْ لِلنَّاسِ",
            translation = "محبوب‌ترین مردم نزد خدا کسی است که سودش به مردم بیشتر برسد.",
            source = "پیامبر اکرم (ص) - کنزالعمال، ح ۱۷۲۰۳"
        )
    )

    fun dailyPrayerFor(dayIndex: Int): DailyPrayer? {
        val normalized = ((dayIndex % 7) + 7) % 7
        return dailyPrayers[normalized]
    }

    fun dailyEventsFor(dayIndex: Int): List<String> {
        val normalized = ((dayIndex % 7) + 7) % 7
        return dailyEvents[normalized]?.events ?: emptyList()
    }

    private val dailyPrayers: Map<Int, DailyPrayer> = mapOf(
        0 to DailyPrayer(
            dayIndex = 0,
            dayLabel = "شنبه",
            title = "دعای روز شنبه",
            text = "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ. اللَّهُمَّ إِنِّي أَسْأَلُكَ فِي هَٰذَا اليَوْمِ الَّذِي جَعَلْتَهُ لِي عِيدًا وَمَهَنَّأً... اللَّهُمَّ اجْعَلْ لِي فِيهِ نَصِيبًا مِنْ رَحْمَتِكَ وَتَوْفِيقِكَ وَعِصْمَتِكَ"
        ),
        1 to DailyPrayer(
            dayIndex = 1,
            dayLabel = "یکشنبه",
            title = "دعای روز یکشنبه",
            text = "اللَّهُمَّ إِنِّي أَسْأَلُكَ فِي هَٰذَا اليَوْمِ الَّذِي جَعَلْتَ لِي فِيهِ حَيَاتِي وَبَدْءَ أَجَلِي... اللَّهُمَّ اجْعَلِ النَّصِيحَةَ لَكَ عِنْدِي وَلِأَوْلِيَائِكَ"
        ),
        2 to DailyPrayer(
            dayIndex = 2,
            dayLabel = "دوشنبه",
            title = "دعای روز دوشنبه",
            text = "اللَّهُمَّ إِنِّي أَسْأَلُكَ فِي هَٰذَا اليَوْمِ الَّذِي ابْتَدَأْتَ فِيهِ خَلْقَ نُورِ السَّمَاوَاتِ وَالْأَرْضِ... اللَّهُمَّ اجْعَلْ لِي فِيهِ قُوَّةً عَلَىٰ عِبَادَتِكَ"
        ),
        3 to DailyPrayer(
            dayIndex = 3,
            dayLabel = "سه‌شنبه",
            title = "دعای روز سه‌شنبه",
            text = "اللَّهُمَّ إِنِّي أَسْأَلُكَ فِي هَٰذَا اليَوْمِ الَّذِي ابْتَدَأْتَ فِيهِ خَلْقَ الثِّمَارِ... اللَّهُمَّ اجْعَلِ الْبِرَّ وَالتَّقْوَىٰ أَحَبَّ إِلَيَّ مِنَ الْمَالِ وَالْأَهْلِ"
        ),
        4 to DailyPrayer(
            dayIndex = 4,
            dayLabel = "چهارشنبه",
            title = "دعای روز چهارشنبه",
            text = "اللَّهُمَّ إِنِّي أَسْأَلُكَ فِي هَٰذَا اليَوْمِ الَّذِي ابْتَدَأْتَ فِيهِ خَلْقَ الدَّوَابِّ... اللَّهُمَّ اغْفِرْ لِي كُلَّ ذَنْبٍ أَذْنَبْتُهُ وَتُبْ عَلَيَّ"
        ),
        5 to DailyPrayer(
            dayIndex = 5,
            dayLabel = "پنج‌شنبه",
            title = "دعای روز پنج‌شنبه",
            text = "اللَّهُمَّ إِنِّي أَسْأَلُكَ فِي هَٰذَا اليَوْمِ الَّذِي خَلَقْتَ فِيهِ آدَمَ وَأَهْبَطْتَهُ إِلَىٰ الْأَرْضِ... اللَّهُمَّ اجْعَلِ الْجَنَّةَ مَأْوَىٰ لِي"
        ),
        6 to DailyPrayer(
            dayIndex = 6,
            dayLabel = "جمعه",
            title = "دعای روز جمعه",
            text = "اللَّهُمَّ إِنِّي أَسْأَلُكَ فِي هَٰذَا اليَوْمِ الْجُمُعَةِ الَّذِي جَعَلْتَهُ لِلْمُسْلِمِينَ عِيدًا... اللَّهُمَّ صَلِّ عَلَىٰ مُحَمَّدٍ وَآلِهِ الطَّاهِرِينَ"
        )
    )

    private val dailyEvents: Map<Int, DailyEventSet> = mapOf(
        0 to DailyEventSet(0, listOf("مبدأ هفته", "روز شنبه")),
        1 to DailyEventSet(1, listOf("روز اول از خلقت نور")),
        2 to DailyEventSet(2, listOf("روز خلقت ثمار")),
        3 to DailyEventSet(3, listOf("روز خلقت دواب")),
        4 to DailyEventSet(4, listOf("روز خلقت انسان")),
        5 to DailyEventSet(5, listOf("روز پیشواز جمعه")),
        6 to DailyEventSet(6, listOf("بهترین روز هفته", "روز جمعه"))
    )
}
