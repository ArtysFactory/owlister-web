"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getSeriesById } from "@/lib/services/comics";
import { Series } from "@/lib/types";
import { SeriesForm } from "@/components/admin/series-form";
import { Spinner } from "@/components/ui/spinner";

export default function EditSeriesPage() {
    const params = useParams();
    const [series, setSeries] = useState<Series | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadSeries() {
            if (params.id) {
                const data = await getSeriesById(params.id as string);
                setSeries(data);
            }
            setLoading(false);
        }
        loadSeries();
    }, [params.id]);

    if (loading) {
        return (
            <div className="flex justify-center py-8">
                <Spinner className="h-8 w-8" />
            </div>
        );
    }

    if (!series) {
        return <div>Série non trouvée</div>;
    }

    return <SeriesForm series={series} />;
}
