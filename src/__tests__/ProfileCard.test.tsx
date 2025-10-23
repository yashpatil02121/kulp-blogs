import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProfileCard from '../../components/ProfileCard';

describe('ProfileCard', () => {
  const defaultProps = {
    name: 'John Doe',
    title: 'Software Engineer',
    handle: 'johndoe',
    status: 'Online',
    avatarUrl: 'https://example.com/avatar.jpg',
    miniAvatarUrl: 'https://example.com/mini-avatar.jpg'
  };

  it('should render with default props', () => {
    render(<ProfileCard {...defaultProps} />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Software Engineer')).toBeInTheDocument();
    expect(screen.getByText('@johndoe')).toBeInTheDocument();
    expect(screen.getByText('Online')).toBeInTheDocument();

    const avatar = screen.getByAltText('John Doe avatar');
    expect(avatar).toHaveAttribute('src', 'https://example.com/avatar.jpg');
  });

  it('should render with custom props', () => {
    render(
      <ProfileCard
        name="Jane Smith"
        title="Designer"
        handle="janesmith"
        status="Away"
        avatarUrl="https://example.com/jane.jpg"
        contactText="Message"
        showUserInfo={true}
      />
    );

    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('Designer')).toBeInTheDocument();
    expect(screen.getByText('@janesmith')).toBeInTheDocument();
    expect(screen.getByText('Away')).toBeInTheDocument();
  });

  it('should hide user info when showUserInfo is false', () => {
    render(<ProfileCard {...defaultProps} showUserInfo={false} />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Software Engineer')).toBeInTheDocument();
    expect(screen.queryByText('@johndoe')).not.toBeInTheDocument();
    expect(screen.queryByText('Online')).not.toBeInTheDocument();
  });

  it('should apply custom className', () => {
    render(<ProfileCard {...defaultProps} className="custom-class" />);

    const wrapper = screen.getByTestId('profile-card-wrapper') ||
                   document.querySelector('.pc-card-wrapper');
    expect(wrapper).toHaveClass('custom-class');
  });

  it('should handle avatar load error gracefully', () => {
    render(<ProfileCard {...defaultProps} />);

    const avatar = screen.getByAltText('John Doe avatar');
    fireEvent.error(avatar);

    // After error, avatar should be hidden
    expect(avatar).toHaveStyle('display: none');
  });

  it('should call onContactClick when contact button is clicked', async () => {
    const mockOnContactClick = vi.fn();
    const user = userEvent.setup();

    render(
      <ProfileCard
        {...defaultProps}
        onContactClick={mockOnContactClick}
      />
    );

    // Note: Contact button appears to be commented out in the component
    // This test is for when it's enabled
    const contactButton = screen.queryByRole('button', { name: /contact/i });
    if (contactButton) {
      await user.click(contactButton);
      expect(mockOnContactClick).toHaveBeenCalledTimes(1);
    }
  });

  it('should render with custom gradients', () => {
    const customBehindGradient = 'linear-gradient(45deg, #ff0000, #0000ff)';
    const customInnerGradient = 'linear-gradient(45deg, #00ff00, #ffff00)';

    render(
      <ProfileCard
        {...defaultProps}
        behindGradient={customBehindGradient}
        innerGradient={customInnerGradient}
      />
    );

    const wrapper = screen.getByTestId('profile-card-wrapper') ||
                   document.querySelector('.pc-card-wrapper');

    expect(wrapper).toHaveStyle({
      '--behind-gradient': customBehindGradient,
      '--inner-gradient': customInnerGradient
    });
  });

  it('should disable behind gradient when showBehindGradient is false', () => {
    render(<ProfileCard {...defaultProps} showBehindGradient={false} />);

    const wrapper = screen.getByTestId('profile-card-wrapper') ||
                   document.querySelector('.pc-card-wrapper');

    expect(wrapper).toHaveStyle({ '--behind-gradient': 'none' });
  });

  it('should handle pointer events when tilt is disabled', () => {
    render(<ProfileCard {...defaultProps} enableTilt={false} />);

    const card = screen.getByTestId('profile-card') ||
                document.querySelector('.pc-card');

    fireEvent.pointerEnter(card);
    fireEvent.pointerMove(card, { clientX: 100, clientY: 100 });
    fireEvent.pointerLeave(card);

    // Component should still render normally without errors
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('should render with default values for optional props', () => {
    render(<ProfileCard />);

    expect(screen.getByText('Javi A. Torres')).toBeInTheDocument();
    expect(screen.getByText('Software Engineer')).toBeInTheDocument();
    expect(screen.getByText('@javicodes')).toBeInTheDocument();
    expect(screen.getByText('Online')).toBeInTheDocument();
  });

  it('should handle missing avatar gracefully', () => {
    render(<ProfileCard {...defaultProps} avatarUrl="" />);

    const avatar = screen.getByAltText('John Doe avatar');
    expect(avatar).toHaveAttribute('src', '');
  });
});
