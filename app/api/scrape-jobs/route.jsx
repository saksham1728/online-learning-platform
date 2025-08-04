import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import EnhancedJobScraper from "../../../lib/enhancedJobScraper.js";

export async function POST(req) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { keywords, location = 'India', testMode = false } = body;

    console.log('Manual job scraping triggered:', { keywords, location, testMode });

    const scraper = new EnhancedJobScraper();
    let results = {};

    try {
      if (testMode) {
        // Test scraping with limited results
        console.log('Running in test mode - limited scraping');
        
        const [linkedinJobs, internshalaJobs] = await Promise.allSettled([
          scraper.scrapeLinkedInJobs(keywords.slice(0, 2), location),
          scraper.scrapeInternshalaJobs(keywords.slice(0, 2), location)
        ]);

        results = {
          linkedin: linkedinJobs.status === 'fulfilled' ? linkedinJobs.value : [],
          internshala: internshalaJobs.status === 'fulfilled' ? internshalaJobs.value : [],
          indeed: [],
          naukri: []
        };
      } else {
        // Full scraping
        console.log('Running full scraping mode');
        
        const [linkedinJobs, internshalaJobs] = await Promise.allSettled([
          scraper.scrapeLinkedInJobs(keywords, location),
          scraper.scrapeInternshalaJobs(keywords, location)
        ]);

        results = {
          linkedin: linkedinJobs.status === 'fulfilled' ? linkedinJobs.value : [],
          internshala: internshalaJobs.status === 'fulfilled' ? internshalaJobs.value : [],
          indeed: [], // Will be added later
          naukri: []  // Will be added later
        };
      }

      // Combine all results
      const allJobs = [
        ...results.linkedin,
        ...results.internshala,
        ...results.indeed,
        ...results.naukri
      ];

      const summary = {
        total: allJobs.length,
        byPortal: {
          linkedin: results.linkedin.length,
          internshala: results.internshala.length,
          indeed: results.indeed.length,
          naukri: results.naukri.length
        }
      };

      console.log('Scraping completed:', summary);

      return NextResponse.json({
        success: true,
        jobs: allJobs,
        summary: summary,
        scrapedAt: new Date().toISOString()
      });

    } finally {
      await scraper.closeBrowser();
    }

  } catch (error) {
    console.error('Manual scraping error:', error);
    return NextResponse.json(
      { 
        error: 'Scraping failed', 
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

export async function GET(req) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Test endpoint to check if scraping service is working
    return NextResponse.json({
      success: true,
      message: 'Job scraping service is available',
      endpoints: {
        manual_scrape: 'POST /api/scrape-jobs',
        job_recommendations: 'POST /api/job-recommendations'
      },
      status: 'ready'
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Service check failed', details: error.message },
      { status: 500 }
    );
  }
}