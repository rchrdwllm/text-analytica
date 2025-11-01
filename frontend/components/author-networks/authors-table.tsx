import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const AuthorsTable = () => {
  const authors = [
    {
      author: "A, B, C",
      document: "An Empirical Analysis of Search in GSAT",
      neighbors: "D, E, F, G",
      centralityScore: "96.4%",
    },
    {
      author: "D, E, F",
      document:
        "Software Agents: Completing Patterns and Constructing User Interfaces",
      neighbors: "A, B, H, I",
      centralityScore: "85.2%",
    },
    {
      author: "G, H",
      document: "Machine Learning Applications in Natural Language Processing",
      neighbors: "C, D, J, K",
      centralityScore: "78.9%",
    },
    {
      author: "I, J, K",
      document: "Deep Neural Networks for Image Recognition",
      neighbors: "E, F, L, M",
      centralityScore: "92.1%",
    },
    {
      author: "L, M, N",
      document: "Reinforcement Learning in Autonomous Systems",
      neighbors: "G, H, O, P",
      centralityScore: "88.7%",
    },
  ];

  return (
    <article className="bg-card p-4 rounded-lg">
      <h2 className="mb-4 font-medium text-xl">Authors</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Author</TableHead>
            <TableHead>Document</TableHead>
            <TableHead>Neighbors</TableHead>
            <TableHead className="text-right">Centrality Score</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {authors.map((author, index) => (
            <TableRow key={index}>
              <TableCell className="font-medium">{author.author}</TableCell>
              <TableCell>{author.document}</TableCell>
              <TableCell>{author.neighbors}</TableCell>
              <TableCell className="text-right">
                {author.centralityScore}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </article>
  );
};

export default AuthorsTable;
