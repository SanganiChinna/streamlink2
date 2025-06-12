const Footer = () => {
  return (
    <footer className="bg-card shadow-sm mt-auto">
      <div className="container mx-auto px-4 py-6 text-center text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} StreamLink. All rights reserved.</p>
        <p className="text-xs mt-1">Powered by Modern Web Technologies</p>
      </div>
    </footer>
  );
};

export default Footer;
