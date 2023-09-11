import React from 'react';
import { render, screen } from '@testing-library/react';
import ServiceCard from '../ServiceCard';

describe('ServiceCard', () => {
  it('should display launch link', () => {
    render(
      <ServiceCard
        description=""
        iconUrl=""
        learnMoreUrl=""
        subtitle=""
        title=""
        launchUrl="test"
      />,
    );
    const link = screen.queryByRole('link', { name: 'Launch' });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', 'test');
  });

  it('should not display launch link if missing launch url', () => {
    render(<ServiceCard description="" iconUrl="" learnMoreUrl="" subtitle="" title="" />);
    expect(screen.queryByRole('link', { name: 'Launch' })).not.toBeInTheDocument();
  });
});
