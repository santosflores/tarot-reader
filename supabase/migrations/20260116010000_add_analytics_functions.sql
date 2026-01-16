
-- Daily Horoscope Stats RPC
CREATE OR REPLACE FUNCTION get_daily_horoscope_stats()
RETURNS TABLE (
    publish_date text,
    total_views bigint,
    conversions bigint,
    avg_seconds numeric
) LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY
    SELECT 
        TO_CHAR(h.publish_date, 'YYYY-MM-DD') as publish_date,
        COUNT(hv.id) as total_views,
        COUNT(hv.id) FILTER (WHERE hv.clicked_tarot_cta) as conversions,
        COALESCE(ROUND(AVG(hv.session_duration_seconds)::numeric, 1), 0) as avg_seconds
    FROM horoscopes h
    LEFT JOIN horoscope_views hv ON h.id = hv.horoscope_id
    WHERE h.publish_date >= CURRENT_DATE - 7
    GROUP BY h.publish_date
    ORDER BY h.publish_date ASC;
END;
$$;

-- Sign Stats RPC
CREATE OR REPLACE FUNCTION get_horoscope_sign_stats()
RETURNS TABLE (
    zodiac_sign text,
    views bigint
) LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY
    SELECT 
        hv.zodiac_sign,
        COUNT(hv.id) as views
    FROM horoscope_views hv
    GROUP BY hv.zodiac_sign
    ORDER BY views DESC;
END;
$$;
