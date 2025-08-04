import PublicCodeViewer from '../../../components/code-sharing/PublicCodeViewer'

export default async function SharePage({ params }) {
  const { shareId } = await params;

  return <PublicCodeViewer shareId={shareId} />;
}

// Generate metadata for better SEO and social sharing
export async function generateMetadata({ params }) {
  const { shareId } = await params;
  
  try {
    // In a real implementation, you might want to fetch the code data here
    // for better SEO, but for now we'll use generic metadata
    return {
      title: 'Shared Code - Code Sharing Portal',
      description: 'View and interact with shared code on our platform',
      openGraph: {
        title: 'Shared Code - Code Sharing Portal',
        description: 'View and interact with shared code on our platform',
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: 'Shared Code - Code Sharing Portal',
        description: 'View and interact with shared code on our platform',
      },
    };
  } catch (error) {
    return {
      title: 'Code Not Found - Code Sharing Portal',
      description: 'The requested code could not be found',
    };
  }
}