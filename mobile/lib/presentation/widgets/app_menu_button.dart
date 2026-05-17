import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppMenuButton extends StatefulWidget {
  final String label;
  final IconData icon;
  final List<Color> gradient;
  final VoidCallback? onPressed;
  final String? badge;
  final bool locked;

  const AppMenuButton({
    super.key,
    required this.label,
    required this.icon,
    required this.gradient,
    this.onPressed,
    this.badge,
    this.locked = false,
  });

  @override
  State<AppMenuButton> createState() => _AppMenuButtonState();
}

class _AppMenuButtonState extends State<AppMenuButton>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _scaleAnimation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 120),
      lowerBound: 0.0,
      upperBound: 0.05,
    );
    _scaleAnimation = Tween<double>(begin: 1.0, end: 0.95).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeInOut),
    );
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void _onTapDown(TapDownDetails _) => _controller.forward();
  void _onTapUp(TapUpDetails _) => _controller.reverse();
  void _onTapCancel() => _controller.reverse();

  @override
  Widget build(BuildContext context) {
    final isLocked = widget.locked || widget.onPressed == null;

    return ScaleTransition(
      scale: _scaleAnimation,
      child: GestureDetector(
        onTapDown: isLocked ? null : _onTapDown,
        onTapUp: isLocked ? null : _onTapUp,
        onTapCancel: isLocked ? null : _onTapCancel,
        onTap: isLocked ? null : widget.onPressed,
        child: Container(
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(20),
            gradient: LinearGradient(
              colors: isLocked
                  ? [const Color(0xFF2D3748), const Color(0xFF1A202C)]
                  : widget.gradient,
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
            boxShadow: isLocked
                ? []
                : [
                    BoxShadow(
                      color: widget.gradient.first.withOpacity(0.4),
                      blurRadius: 16,
                      offset: const Offset(0, 6),
                    ),
                  ],
          ),
          child: Stack(
            children: [
              // Background glow circle
              if (!isLocked)
                Positioned(
                  right: -16,
                  top: -16,
                  child: Container(
                    width: 80,
                    height: 80,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: Colors.white.withOpacity(0.07),
                    ),
                  ),
                ),
              // Content
              Padding(
                padding: const EdgeInsets.all(20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Container(
                          padding: const EdgeInsets.all(10),
                          decoration: BoxDecoration(
                            color: Colors.white.withOpacity(0.15),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Icon(
                            isLocked ? Icons.lock_outline : widget.icon,
                            size: 28,
                            color: isLocked
                                ? Colors.white38
                                : Colors.white,
                          ),
                        ),
                        if (widget.badge != null && !isLocked)
                          Container(
                            padding: const EdgeInsets.symmetric(
                                horizontal: 8, vertical: 3),
                            decoration: BoxDecoration(
                              color: Colors.white.withOpacity(0.2),
                              borderRadius: BorderRadius.circular(20),
                            ),
                            child: Text(
                              widget.badge!,
                              style: GoogleFonts.poppins(
                                color: Colors.white,
                                fontSize: 11,
                                fontWeight: FontWeight.w700,
                              ),
                            ),
                          ),
                      ],
                    ),
                    Text(
                      widget.label,
                      style: GoogleFonts.poppins(
                        color: isLocked ? Colors.white38 : Colors.white,
                        fontSize: 14,
                        fontWeight: FontWeight.w700,
                        letterSpacing: 0.5,
                        height: 1.2,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
