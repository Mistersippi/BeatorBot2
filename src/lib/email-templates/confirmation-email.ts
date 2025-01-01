export const getConfirmationEmailTemplate = () => `
<div style="max-width: 600px; margin: 0 auto; padding: 40px 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
    <!-- Logo and Header -->
    <div style="text-align: center; margin-bottom: 40px;">
        <h1 style="margin: 0; font-size: 28px; color: #7C3AED;">
            <span style="font-size: 32px;">🎵</span> Beat or Bot <span style="font-size: 32px;">🤖</span>
        </h1>
    </div>

    <!-- Main Content -->
    <div style="background: white; border-radius: 12px; padding: 32px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        <h2 style="margin: 0 0 24px 0; font-size: 24px; color: #1F2937; text-align: center;">
            Welcome to the Future of Music! 🚀
        </h2>

        <p style="margin: 0 0 24px 0; font-size: 16px; color: #4B5563; line-height: 1.5; text-align: center;">
            Where human artistry meets AI innovation!<br>
            Confirm your email to join the revolution 🎸
        </p>

        <!-- Verification Box -->
        <div style="margin: 24px 0; padding: 20px; background: linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%); border-radius: 12px; text-align: center; color: white;">
            <p style="margin: 0 0 16px 0; font-size: 16px;">
                Click below to verify your email:
            </p>
            <a href="{{ .ConfirmationURL }}" 
               style="display: inline-block; padding: 14px 32px; background: white; color: #7C3AED; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; transition: background 0.2s;">
                Start My Journey 🎵
            </a>
        </div>

        <!-- Two-Column Creator Sections -->
        <div style="display: grid; grid-template-columns: 1fr; gap: 24px; margin: 32px 0;">
            <!-- For Traditional Artists -->
            <div style="padding: 24px; background: #F9FAFB; border-radius: 12px; border-left: 4px solid #7C3AED;">
                <h3 style="margin: 0 0 16px 0; font-size: 20px; color: #1F2937;">
                    🎸 For Traditional Artists
                </h3>
                <div style="display: grid; gap: 16px;">
                    <div style="display: flex; align-items: start; gap: 12px;">
                        <span style="font-size: 24px;">💰</span>
                        <div>
                            <h4 style="margin: 0 0 4px 0; color: #1F2937; font-size: 16px;">Industry-Leading Payouts</h4>
                            <p style="margin: 0; color: #6B7280; font-size: 14px;">
                                We're building the most artist-friendly streaming platform ever. Better rates than Spotify, Apple Music, or any other platform!
                            </p>
                        </div>
                    </div>
                    <div style="display: flex; align-items: start; gap: 12px;">
                        <span style="font-size: 24px;">🎯</span>
                        <div>
                            <h4 style="margin: 0 0 4px 0; color: #1F2937; font-size: 16px;">Featured Artist Program</h4>
                            <p style="margin: 0; color: #6B7280; font-size: 14px;">
                                Get spotlighted in our challenge pools! More exposure = more streams = more earnings 📈
                            </p>
                        </div>
                    </div>
                    <div style="display: flex; align-items: start; gap: 12px;">
                        <span style="font-size: 24px;">🎧</span>
                        <div>
                            <h4 style="margin: 0 0 4px 0; color: #1F2937; font-size: 16px;">Pro Curated Playlists</h4>
                            <p style="margin: 0; color: #6B7280; font-size: 14px;">
                                Our music experts create genre-specific playlists that actually pay the bills!
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- For AI Music Creators -->
            <div style="padding: 24px; background: #F9FAFB; border-radius: 12px; border-left: 4px solid #5B21B6;">
                <h3 style="margin: 0 0 16px 0; font-size: 20px; color: #1F2937;">
                    🤖 For AI Music Creators
                </h3>
                <div style="display: grid; gap: 16px;">
                    <div style="display: flex; align-items: start; gap: 12px;">
                        <span style="font-size: 24px;">🏆</span>
                        <div>
                            <h4 style="margin: 0 0 4px 0; color: #1F2937; font-size: 16px;">AI Creator Leaderboard</h4>
                            <p style="margin: 0; color: #6B7280; font-size: 14px;">
                                Climb the ranks of our AI music creator leaderboard! Most convincing AI tracks get special recognition.
                            </p>
                        </div>
                    </div>
                    <div style="display: flex; align-items: start; gap: 12px;">
                        <span style="font-size: 24px;">🔬</span>
                        <div>
                            <h4 style="margin: 0 0 4px 0; color: #1F2937; font-size: 16px;">Innovation Rewards</h4>
                            <p style="margin: 0; color: #6B7280; font-size: 14px;">
                                Push the boundaries of AI music! Get rewarded for creating the most innovative and groundbreaking tracks.
                            </p>
                        </div>
                    </div>
                    <div style="display: flex; align-items: start; gap: 12px;">
                        <span style="font-size: 24px;">🤝</span>
                        <div>
                            <h4 style="margin: 0 0 4px 0; color: #1F2937; font-size: 16px;">Collaboration Opportunities</h4>
                            <p style="margin: 0; color: #6B7280; font-size: 14px;">
                                Connect with traditional artists for unique human-AI collaborations!
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Game Features -->
        <div style="margin: 32px 0; padding: 24px; background: #F3F4F6; border-radius: 12px;">
            <h3 style="margin: 0 0 16px 0; font-size: 18px; color: #1F2937; text-align: center;">
                🎮 Daily Challenges & Games
            </h3>
            <div style="display: grid; gap: 16px;">
                <div style="display: flex; align-items: start; gap: 12px;">
                    <span style="font-size: 24px;">🎲</span>
                    <div>
                        <h4 style="margin: 0 0 4px 0; color: #1F2937; font-size: 16px;">Daily Music Detective</h4>
                        <p style="margin: 0; color: #6B7280; font-size: 14px;">
                            Test your ear with fresh tracks daily! Can you spot which ones are AI-generated?
                        </p>
                    </div>
                </div>
                <div style="display: flex; align-items: start; gap: 12px;">
                    <span style="font-size: 24px;">🏆</span>
                    <div>
                        <h4 style="margin: 0 0 4px 0; color: #1F2937; font-size: 16px;">Global Rankings</h4>
                        <p style="margin: 0; color: #6B7280; font-size: 14px;">
                            Compete with music detectives worldwide! Rise through the ranks!
                        </p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Coming Soon Features -->
        <div style="margin: 32px 0; padding: 24px; background: #F3F4F6; border-radius: 12px;">
            <h3 style="margin: 0 0 16px 0; font-size: 18px; color: #1F2937; text-align: center;">
                🚀 Launching Soon!
            </h3>
            <ul style="margin: 0; padding: 0; list-style: none; color: #4B5563; font-size: 14px;">
                <li style="margin-bottom: 12px; padding-left: 24px; position: relative;">
                    <span style="position: absolute; left: 0;">🤝</span>
                    Artist Partnership Program with exclusive perks
                </li>
                <li style="margin-bottom: 12px; padding-left: 24px; position: relative;">
                    <span style="position: absolute; left: 0;">🎤</span>
                    Artist Spotlight Series featuring our top performers
                </li>
                <li style="margin-bottom: 12px; padding-left: 24px; position: relative;">
                    <span style="position: absolute; left: 0;">📱</span>
                    Mobile app with integrated artist profiles
                </li>
                <li style="margin-bottom: 12px; padding-left: 24px; position: relative;">
                    <span style="position: absolute; left: 0;">🎛️</span>
                    AI Music Creation Tools & Resources
                </li>
                <li style="margin-bottom: 12px; padding-left: 24px; position: relative;">
                    <span style="position: absolute; left: 0;">🤖</span>
                    AI Creator Workshop Series
                </li>
                <li style="padding-left: 24px; position: relative;">
                    <span style="position: absolute; left: 0;">🔄</span>
                    Human-AI Music Fusion Program
                </li>
            </ul>
        </div>

        <!-- Platform Unique Features -->
        <div style="margin: 32px 0; padding: 24px; background: #FDF4FF; border-radius: 12px;">
            <h3 style="margin: 0 0 16px 0; font-size: 18px; color: #1F2937; text-align: center;">
                Why We're Different 🌟
            </h3>
            <div style="display: grid; gap: 16px;">
                <div style="display: flex; align-items: start; gap: 12px;">
                    <span style="font-size: 24px;">🤝</span>
                    <div>
                        <h4 style="margin: 0 0 4px 0; color: #1F2937; font-size: 16px;">Bridging Two Worlds</h4>
                        <p style="margin: 0; color: #6B7280; font-size: 14px;">
                            The first platform celebrating both human creativity and AI innovation in music!
                        </p>
                    </div>
                </div>
                <div style="display: flex; align-items: start; gap: 12px;">
                    <span style="font-size: 24px;">💡</span>
                    <div>
                        <h4 style="margin: 0 0 4px 0; color: #1F2937; font-size: 16px;">Innovation Hub</h4>
                        <p style="margin: 0; color: #6B7280; font-size: 14px;">
                            Experiment, collaborate, and push the boundaries of what's possible in music!
                        </p>
                    </div>
                </div>
                <div style="display: flex; align-items: start; gap: 12px;">
                    <span style="font-size: 24px;">🎯</span>
                    <div>
                        <h4 style="margin: 0 0 4px 0; color: #1F2937; font-size: 16px;">Fair Platform</h4>
                        <p style="margin: 0; color: #6B7280; font-size: 14px;">
                            Equal opportunities for both traditional and AI-powered creators!
                        </p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Quick Links -->
        <div style="margin-top: 32px; padding: 24px; background: white; border-radius: 12px; text-align: center;">
            <h3 style="margin: 0 0 16px 0; font-size: 18px; color: #1F2937;">
                Quick Links 🔗
            </h3>
            <div style="display: flex; justify-content: center; gap: 16px; flex-wrap: wrap;">
                <a href="{{ .SiteURL }}/artist-program" style="color: #7C3AED; text-decoration: none;">Artist Program</a>
                <a href="{{ .SiteURL }}/ai-creators" style="color: #7C3AED; text-decoration: none;">AI Creator Hub</a>
                <a href="{{ .SiteURL }}/submit" style="color: #7C3AED; text-decoration: none;">Submit Music</a>
                <a href="{{ .SiteURL }}/discord" style="color: #7C3AED; text-decoration: none;">Join Community</a>
            </div>
        </div>
    </div>

    <!-- Footer -->
    <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #E5E7EB; text-align: center;">
        <p style="margin: 0 0 16px 0; font-size: 14px; color: #6B7280;">
            "Where human artistry meets AI innovation - creating the future of music together!" 🎵
        </p>
        <p style="margin: 0 0 8px 0; font-size: 12px; color: #6B7280;">
            This link expires in 24 hours - don't miss out on the future of music! 🚀
        </p>
        <div style="font-size: 14px; color: #4B5563;">
            <strong>Beat or Bot</strong>
            <br>
            <a href="{{ .SiteURL }}" style="color: #7C3AED; text-decoration: none;">
                www.beatorbot.com
            </a>
        </div>
    </div>
</div>
`;
