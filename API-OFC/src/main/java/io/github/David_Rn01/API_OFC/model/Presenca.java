package io.github.David_Rn01.API_OFC.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "presenca")
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class Presenca {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "aluno_cpf")
    private Aluno aluno;

    @ManyToOne
    @JoinColumn(name = "viage_id")
    private Viagem viagem;

    @Column
    private Presente presente;

    @Column
    private LocalDateTime confirmadoEm;
}
